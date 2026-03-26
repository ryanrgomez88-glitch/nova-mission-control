import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "green" | "blue" | "purple" | "red" | "yellow"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[#2A2A3E] text-slate-300",
      green: "bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30",
      blue: "bg-[#60A5FA]/20 text-[#60A5FA] border border-[#60A5FA]/30",
      purple: "bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30",
      red: "bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/30",
      yellow: "bg-[#FCD34D]/20 text-[#FCD34D] border border-[#FCD34D]/30",
    }
    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
