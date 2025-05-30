"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Trash2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  error?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsStreaming(true)
    setError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No reader available")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      let done = false
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading

        if (value) {
          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") {
                setIsStreaming(false)
                break
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.error) {
                  throw new Error(parsed.error)
                }
                if (parsed.content) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id ? { ...msg, content: msg.content + parsed.content } : msg,
                    ),
                  )
                }
              } catch (e) {
                if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
                  throw e
                }
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
          timestamp: new Date(),
          error: true,
        },
      ])
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  const retryLastMessage = () => {
    if (messages.length >= 2) {
      const lastUserMessage = messages[messages.length - 2]
      if (lastUserMessage.role === "user") {
        setInput(lastUserMessage.content)
        // Remove the last two messages (user + error response)
        setMessages((prev) => prev.slice(0, -2))
        setError(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4">
      <div className="mx-auto max-w-4xl h-screen sm:h-auto">
        <Card className="h-[100vh] sm:h-[90vh] flex flex-col shadow-xl">
          <CardHeader className="border-b bg-white/50 backdrop-blur-sm p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <span className="hidden sm:inline">Gemini Chat Assistant</span>
                <span className="sm:hidden">Gemini Chat</span>
              </CardTitle>
              <div className="flex gap-1 sm:gap-2">
                {error && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryLastMessage}
                    className="gap-1 sm:gap-2 text-orange-600 border-orange-200 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Retry</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  disabled={messages.length === 0}
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <ScrollArea className="flex-1 p-2 sm:p-4" ref={scrollAreaRef}>
              <div className="space-y-3 sm:space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-4 sm:py-8 px-4">
                    <Bot className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-blue-600" />
                    <h3 className="text-base sm:text-lg font-medium mb-2">Welcome to Gemini Chat</h3>
                    <p className="mb-3 sm:mb-4 text-sm sm:text-base">Start a conversation by typing a message below.</p>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center max-w-md mx-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("Tell me a fun fact about space")}
                        className="text-xs sm:text-sm w-full sm:w-auto"
                      >
                        🚀 Space fact
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("Write a short poem about coding")}
                        className="text-xs sm:text-sm w-full sm:w-auto"
                      >
                        📝 Write a poem
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("Explain quantum computing simply")}
                        className="text-xs sm:text-sm w-full sm:w-auto"
                      >
                        🔬 Quantum computing
                      </Button>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%]",
                      message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
                    )}
                  >
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 mt-1">
                      <AvatarFallback
                        className={cn(
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : message.error
                              ? "bg-red-600 text-white"
                              : "bg-green-600 text-white",
                        )}
                      >
                        {message.role === "user" ? (
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : message.error ? (
                          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-sm",
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : message.error
                            ? "bg-red-50 border border-red-200 text-red-800"
                            : "bg-white border shadow-sm",
                      )}
                    >
                      <div className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">
                        {message.content}
                      </div>
                      <div
                        className={cn(
                          "text-xs mt-1 opacity-70",
                          message.role === "user"
                            ? "text-blue-100"
                            : message.error
                              ? "text-red-600"
                              : "text-muted-foreground",
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {isStreaming && (
                  <div className="flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] mr-auto">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 mt-1">
                      <AvatarFallback className="bg-green-600 text-white">
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white border shadow-sm rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                      <div className="flex items-center gap-1">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t bg-white/50 backdrop-blur-sm p-3 sm:p-4">
              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="text-xs sm:text-sm break-words">{error}</span>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 text-sm sm:text-base"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2 text-center leading-tight">
                <span className="hidden sm:inline">Powered by Google Gemini AI • Using gemini-1.5-flash model</span>
                <span className="sm:hidden">Powered by Gemini AI</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
