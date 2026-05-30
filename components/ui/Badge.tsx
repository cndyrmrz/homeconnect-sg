import { cn } from "@/lib/utils"

interface BadgeProps {
  label: string
  variant?: "green" | "yellow" | "red" | "blue" | "gray" | "purple"
  className?: string
}

const variants = {
  green: "bg-emerald-100 text-emerald-800",
  yellow: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  blue: "bg-blue-100 text-blue-800",
  gray: "bg-gray-100 text-gray-700",
  purple: "bg-purple-100 text-purple-800",
}

export const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  PENDING: "yellow",
  CONFIRMED: "green",
  COMPLETED: "blue",
  CANCELLED: "red",
  RESCHEDULED: "purple",
  NO_SHOW: "gray",
}

export default function Badge({ label, variant = "gray", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {label}
    </span>
  )
}
