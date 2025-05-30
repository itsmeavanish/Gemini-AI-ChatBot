"use client"

import type React from "react"
import Neo from "../components/Neo/Neo"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Send, User, Trash2, AlertCircle, Sparkles, Zap, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

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
   const {theme}=useTheme();
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
        setMessages((prev) => prev.slice(0, -2))
        setError(null)
      }
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  // Enhanced Logo Component with animations
  const EnhancedLogo = ({ className, animated = false }: { className?: string; animated?: boolean }) => (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div
        className={cn(
          "relative rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-0.5",
          animated && "animate-pulse",
        )}
      >
        <div className="rounded-full bg-background p-1">
          <div className="rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-2">
            <Sparkles className="h-full w-full text-white" />
          </div>
        </div>
      </div>
      {animated && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-ping" />
      )}
    </div>
  )

  const quickPrompts = [
    { icon: "🚀", text: "Tell me a fun fact about space", gradient: "from-blue-500 to-cyan-500" },
    { icon: "📝", text: "Write a short poem about coding", gradient: "from-purple-500 to-pink-500" },
    { icon: "🔬", text: "Explain quantum computing simply", gradient: "from-green-500 to-emerald-500" },
    { icon: "🎨", text: "Help me brainstorm creative ideas", gradient: "from-orange-500 to-red-500" },
  ]

  return (
<>
<Neo color={`${theme ==="light" ?"#5700FF" :"#3737FF"}`} />
    <div className="min-h-screen  p-2 sm:p-4 transition-all duration-500">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/5 to-cyan-400/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative mx-auto max-w-4xl h-screen sm:h-auto">
        <Neo color={`${theme ==="light" ?"#5700FF" :"#3737FF"}`} />
        <Card className="h-[100vh] sm:h-[90vh] flex flex-col shadow-2xl border-0bg-transparent backdrop-blur-xl">
          <Neo color="blue"/>
          <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="h-6 w-6 sm:h-8 sm:w-8">
                  <EnhancedLogo />
                </div>
                <div className="flex flex-col">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                    <span className="hidden sm:inline">Neo  Chat Assistant</span>
                    <span className="sm:hidden">Neo Chat</span>
                  </span>
                  <span className="text-xs text-muted-foreground font-normal">Made with ❣</span>
                </div>
              </CardTitle>
              <div className="flex items-center gap-1 sm:gap-2">
                <ThemeToggle />
                {error && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryLastMessage}
                    className="gap-1 sm:gap-2 text-orange-600 border-orange-200 dark:border-orange-800 text-xs sm:text-sm px-2 sm:px-3 hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-all duration-300"
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
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-300"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <ScrollArea className="flex-1 p-2 sm:p-4" ref={scrollAreaRef}>
              <div className="space-y-4 sm:space-y-6">
                {messages.length === 0 && (
                  <div className="text-center py-8 sm:py-16 px-4">
                    <div className="h-16 w-16 sm:h-24 sm:w-24 mx-auto mb-6">
                      <EnhancedLogo animated />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Welcome to Neo
                    </h3>
                    <p className="mb-8 text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Experience the future of AI conversation with stunning visuals and intelligent responses.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      {quickPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => setInput(prompt.text)}
                          className={cn(
                            "h-auto p-4 text-left justify-start group hover:scale-105 transition-all duration-300 border-2 hover:border-transparent",
                            "hover:shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-blue-400/25",
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300",
                              prompt.gradient,
                            )}
                          >
                            <span className="text-white text-sm">{prompt.icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {prompt.text}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 sm:gap-4 max-w-[85%] sm:max-w-[80%] group animate-in slide-in-from-bottom-2 duration-500",
                      message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 mt-1 ring-2 ring-white dark:ring-slate-800 shadow-lg">
                      <AvatarFallback
                        className={cn(
                          message.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                            : message.error
                              ? "bg-gradient-to-br from-red-500 to-red-600 text-white"
                              : "bg-transparent p-0",
                        )}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : message.error ? (
                          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <EnhancedLogo />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base shadow-lg backdrop-blur-sm",
                          message.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-4"
                            : message.error
                              ? "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 mr-4"
                              : "bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 mr-4",
                        )}
                      >
                        <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20 dark:border-slate-700/50">
                          <div
                            className={cn(
                              "text-xs opacity-70",
                              message.role === "user"
                                ? "text-blue-100"
                                : message.error
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-muted-foreground",
                            )}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {message.role === "assistant" && !message.error && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(message.content)}
                                className="h-6 w-6 p-0 hover:bg-white/20 dark:hover:bg-slate-700/50"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-white/20 dark:hover:bg-slate-700/50"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-white/20 dark:hover:bg-slate-700/50"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isStreaming && (
                  <div className="flex gap-3 sm:gap-4 max-w-[85%] sm:max-w-[80%] mr-auto animate-in slide-in-from-bottom-2">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 mt-1 ring-2 ring-white dark:ring-slate-800 shadow-lg">
                      <AvatarFallback className="bg-transparent p-0">
                        <EnhancedLogo animated />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-lg backdrop-blur-sm rounded-2xl px-4 py-3 sm:px-6 sm:py-4 mr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                        <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-3 sm:p-6">
              {error && (
                <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border border-red-200 dark:border-red-800 rounded-xl text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span className="text-red-800 dark:text-red-200 break-words">{error}</span>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="pr-12 h-12 text-sm sm:text-base bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-lg backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-3 text-center leading-tight">
                <span className="hidden sm:inline">
                  ✨ Powered by Google Gemini AI • Enhanced with beautiful design
                </span>
                <span className="sm:hidden">✨ Powered by Gemini AI</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}
