import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { isSlotAvailable } from "@/lib/slots"
import { AppointmentType } from "@prisma/client"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    clientName,
    clientEmail,
    clientPhone,
    clientWhatsapp,
    propertyAddress,
    district,
    appointmentType,
    scheduledAt,
    notes,
  } = body

  if (!clientName || !clientEmail || !clientPhone || !clientWhatsapp || !appointmentType || !scheduledAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const realtor = await prisma.realtor.findFirst()
  if (!realtor) return NextResponse.json({ error: "No realtor configured" }, { status: 500 })

  const scheduled = new Date(scheduledAt)
  const available = await isSlotAvailable(realtor.id, scheduled)
  if (!available) {
    return NextResponse.json({ error: "Slot is no longer available" }, { status: 409 })
  }

  const appointment = await prisma.appointment.create({
    data: {
      realtorId: realtor.id,
      clientName,
      clientEmail,
      clientPhone,
      clientWhatsapp,
      propertyAddress,
      district,
      appointmentType: appointmentType as AppointmentType,
      scheduledAt: scheduled,
      notes,
    },
    include: { realtor: true },
  })

  await fetch(`${process.env.NEXT_PUBLIC_BOOKING_URL}/api/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "NEW_BOOKING", appointmentId: appointment.id }),
  }).catch(console.error)

  return NextResponse.json(appointment, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const date = searchParams.get("date")
  const type = searchParams.get("type")

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (type) where.appointmentType = type
  if (date) {
    const d = new Date(date)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    where.scheduledAt = { gte: d, lt: next }
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { realtor: true },
    orderBy: { scheduledAt: "desc" },
  })

  return NextResponse.json(appointments)
}
