import { cn } from "@/lib/utils"

// Option 1: Custom SVG Logo with Gradient
export const GradientLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
    <circle cx="12" cy="12" r="10" fill="url(#gradient)" />
    <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
  </svg>
)

// Option 2: Sparkle/AI Logo
export const SparkleAILogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
    <circle cx="12" cy="12" r="10" fill="url(#sparkleGradient)" />
    <path d="M12 6l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3L12 6z" fill="white" />
    <defs>
      <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
  </svg>
)

// Option 3: Modern Geometric Logo
export const GeometricLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
    <rect x="4" y="4" width="16" height="16" rx="4" fill="url(#geoGradient)" />
    <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <defs>
      <linearGradient id="geoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
  </svg>
)

// Option 4: Text-based Logo
export const TextLogo = ({ className, text = "AI" }: { className?: string; text?: string }) => (
  <div
    className={cn(
      "flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-full text-white font-bold text-xs",
      className,
    )}
  >
    {text}
  </div>
)

// Option 5: Brain/Neural Network Logo
export const BrainLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
    <circle cx="12" cy="12" r="10" fill="url(#brainGradient)" />
    <path
      d="M8 10c0-2 1.5-3 3-3s3 1 3 3c0 1-0.5 2-1 2.5 0.5 0.5 1 1.5 1 2.5 0 2-1.5 3-3 3s-3-1-3-3c0-1 0.5-2 1-2.5C8.5 12 8 11 8 10z"
      fill="white"
    />
    <circle cx="10" cy="10" r="0.5" fill="url(#brainGradient)" />
    <circle cx="14" cy="10" r="0.5" fill="url(#brainGradient)" />
    <defs>
      <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
)
