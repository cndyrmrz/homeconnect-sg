import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateRescheduleToken, getTokenExpiry } from "@/lib/reschedule"
import { isSlotAvailable } from "@/lib/slots"

async function validateToken(token: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { rescheduleToken: token },
    include: { realtor: true },
  })

  if (!appointment) return { valid: false, reason: "Token not found" }
  if (appointment.status !== "CONFIRMED")
    return { valid: false, reason: "Appointment is not in confirmed status" }
  if (appointment.rescheduleExpiry && appointment.rescheduleExpiry < new Date())
    return { valid: false, reason: "Link has expired" }
  if (appointment.rescheduleCount >= 2)
    return { valid: false, reason: "Max reschedules reached", maxReached: true }

  return { valid: true, appointment }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const result = await validateToken(params.token)
  if (!result.valid) {
    return NextResponse.json(
      { valid: false, reason: result.reason, maxReached: result.maxReached ?? false },
      { status: 200 }
    )
  }
  return NextResponse.json({ valid: true, appointment: result.appointment })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const result = await validateToken(params.token)
  if (!result.valid || !result.appointment) {
    return NextResponse.json({ error: result.reason }, { status: 400 })
  }

  const { newScheduledAt } = await req.json()
  const newDate = new Date(newScheduledAt)

  const available = await isSlotAvailable(
    result.appointment.realtorId,
    newDate,
    result.appointment.id
  )
  if (!available) {
    return NextResponse.json({ error: "Slot not available" }, { status: 409 })
  }

  const newCount = result.appointment.rescheduleCount + 1
  const newToken = newCount < 2 ? generateRescheduleToken() : null
  const newExpiry = newCount < 2 ? getTokenExpiry() : null

  const updated = await prisma.appointment.update({
    where: { id: result.appointment.id },
    data: {
      previousScheduledAt: result.appointment.scheduledAt,
      scheduledAt: newDate,
      rescheduleCount: newCount,
      rescheduleToken: newToken,
      rescheduleExpiry: newExpiry,
    },
    include: { realtor: true },
  })

  await fetch(`${process.env.NEXT_PUBLIC_BOOKING_URL}/api/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "BOOKING_RESCHEDULED", appointmentId: updated.id }),
  }).catch(console.error)

  return NextResponse.json({ success: true, appointment: updated })
}
