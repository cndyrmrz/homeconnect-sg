import { randomBytes } from "crypto"

export function generateRescheduleToken(): string {
  return randomBytes(32).toString("hex")
}

export function getRescheduleUrl(token: string): string {
  return `${process.env.NEXT_PUBLIC_BOOKING_URL}/reschedule/${token}`
}

export function getTokenExpiry(): Date {
  const d = new Date()
  d.setHours(d.getHours() + 48)
  return d
}
