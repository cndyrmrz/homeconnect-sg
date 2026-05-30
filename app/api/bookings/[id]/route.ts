export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateRescheduleToken, getTokenExpiry } from "@/lib/reschedule"
import { isSlotAvailable } from "@/lib/slots"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { status, notes, scheduledAt } = body

  const existing = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { realtor: true },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updateData: Record<string, unknown> = {}
  if (notes !== undefined) updateData.notes = notes

  if (status) {
    updateData.status = status

    if (status === "CONFIRMED") {
      updateData.rescheduleToken = generateRescheduleToken()
      updateData.rescheduleExpiry = getTokenExpiry()
    }

    if (status === "RESCHEDULED" && scheduledAt) {
      const newDate = new Date(scheduledAt)
      const available = await isSlotAvailable(existing.realtorId, newDate, params.id)
      if (!available) {
        return NextResponse.json({ error: "Slot not available" }, { status: 409 })
      }
      updateData.previousScheduledAt = existing.scheduledAt
      updateData.scheduledAt = newDate
      updateData.rescheduleToken = generateRescheduleToken()
      updateData.rescheduleExpiry = getTokenExpiry()
    }
  }

  const appointment = await prisma.appointment.update({
    where: { id: params.id },
    data: updateData,
    include: { realtor: true },
  })

  const notifyType =
    status === "CONFIRMED"
      ? "BOOKING_CONFIRMED"
      : status === "CANCELLED"
      ? "BOOKING_CANCELLED"
      : status === "RESCHEDULED"
      ? "BOOKING_RESCHEDULED"
      : null

  if (notifyType) {
    await fetch(`${process.env.NEXT_PUBLIC_BOOKING_URL}/api/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: notifyType, appointmentId: appointment.id }),
    }).catch(console.error)
  }

  return NextResponse.json(appointment)
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { realtor: true },
  })
  if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(appointment)
}
