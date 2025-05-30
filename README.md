# Gemini Chatbot - Next.js & Google AI Integration

A modern, responsive chatbot interface built with Next.js 14, Google Gemini API, and Shadcn UI components featuring real-time streaming responses.

## Features

- 🤖 **Google Gemini AI Integration** - Powered by Google's latest Gemini Pro model
- 💬 **Real-time Streaming** - See AI responses as they're generated
- 🎨 **Modern UI** - Clean, responsive design using Shadcn UI components
- 📱 **Mobile Responsive** - Works seamlessly on all device sizes
- ⚡ **Fast Performance** - Built with Next.js 14 App Router
- 🔄 **Auto-scroll** - Automatically scrolls to latest messages
- 🗑️ **Clear Chat** - Easy chat history management
- ⚠️ **Error Handling** - Graceful error handling and user feedback

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI Integration**: \`@google/generative-ai\`
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Google AI API Key

## Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd gemini-chatbot
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Set up environment variables**
   
   Create a \`.env.local\` file in the root directory:
   \`\`\`env
   GOOGLE_API_KEY=your_google_api_key_here
   \`\`\`

   To get your Google AI API key:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your \`.env.local\` file

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main chat interface
├── components/
│   └── ui/                      # Shadcn UI components
├── lib/
│   └── utils.ts                 # Utility functions
├── .env.local                   # Environment variables
└── README.md
\`\`\`

## API Routes

### POST /api/chat

Handles chat messages and returns streaming responses from Google Gemini.

**Request Body:**
\`\`\`json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ]
}
\`\`\`

**Response:**
Server-Sent Events (SSE) stream with JSON chunks containing the AI response.

## Key Features Implementation

### Streaming Responses
The application implements real-time streaming using:
- Google Gemini's \`sendMessageStream\` method
- Server-Sent Events (SSE) for client-server communication
- ReadableStream API for handling streaming data

### State Management
- React useState for managing chat history
- Real-time message updates during streaming
- Loading and error states

### UI Components
- Responsive chat bubbles with user/AI distinction
- Auto-scrolling message container
- Typing indicators during AI response generation
- Clean, modern design with proper spacing and typography

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**
   - Visit [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add your \`GOOGLE_API_KEY\` environment variable
   - Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| \`GOOGLE_API_KEY\` | Your Google AI API key | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## Acknowledgments

- [Google AI](https://ai.google.dev/) for the Gemini API
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful components
- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for hosting and deployment
\`\`\`
