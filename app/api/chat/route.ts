import { GoogleGenerativeAI } from "@google/generative-ai"
import type { NextRequest } from "next/server"
const apiKey="AIzaSyCeuJWAwNPnhh0mflQkltpjiKwLsivN-dU"
const genAI = new GoogleGenerativeAI(apiKey)

// Available Gemini models (in order of preference)
const AVAILABLE_MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"]

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!process.env.GOOGLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Google API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Try models in order of preference
    let model
    let modelError

    for (const modelName of AVAILABLE_MODELS) {
      try {
        model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        })
        break // Successfully created model
      } catch (error) {
        modelError = error
        console.warn(`Failed to initialize model ${modelName}:`, error)
        continue
      }
    }

    if (!model) {
      console.error("All models failed to initialize:", modelError)
      return new Response(JSON.stringify({ error: "No available models" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Convert messages to Gemini format
    const chatHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    const lastMessage = messages[messages.length - 1]

    const chat = model.startChat({
      history: chatHistory,
    })

    const result = await chat.sendMessageStream(lastMessage.content)

    // Create a readable stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            if (chunkText) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunkText })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("Streaming error:", error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Streaming failed" })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)

    // Handle specific Google AI errors
    if (error instanceof Error) {
      if (error.message.includes("API_KEY") || error.message.includes("401")) {
        return new Response(JSON.stringify({ error: "Invalid API key" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }
      if (error.message.includes("RATE_LIMIT") || error.message.includes("429")) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        })
      }
      if (error.message.includes("not found") || error.message.includes("404")) {
        return new Response(JSON.stringify({ error: "Model not available. Please check your API configuration." }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      }
      if (error.message.includes("PERMISSION_DENIED") || error.message.includes("403")) {
        return new Response(JSON.stringify({ error: "Permission denied. Please check your API key permissions." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
