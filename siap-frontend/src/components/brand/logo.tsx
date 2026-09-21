import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "light" | "dark"
  href?: string
  className?: string
}

const sizes = {
  sm: { mark: "h-7 w-7 rounded-lg", text: "text-lg" },
  md: { mark: "h-8 w-8 rounded-xl", text: "text-xl" },
  lg: { mark: "h-10 w-10 rounded-xl", text: "text-2xl" },
}

export function Logo({ size = "md", variant = "dark", href, className }: LogoProps) {
  const s = sizes[size]
  const textColor = variant === "light" ? "text-white" : "text-slate-900"

  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          s.mark,
          "bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/25 flex items-center justify-center"
        )}
      >
        <span className="text-white font-bold text-xs">S</span>
      </div>
      <span className={cn("font-bold tracking-tight", s.text, textColor)}>SIAP</span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-90">
        {content}
      </Link>
    )
  }

  return content
}
