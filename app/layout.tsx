import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gemini Chat - AI Assistant",
  description: "A modern chatbot powered by Google Gemini AI with real-time streaming responses",
  keywords: ["AI", "chatbot", "Gemini", "Google AI", "Next.js"],
  authors: [{ name: "Avanish" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gemini Chat",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-rendering-optimized`}>{children}</body>
    </html>
  )
}
