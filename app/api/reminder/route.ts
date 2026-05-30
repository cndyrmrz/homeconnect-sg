export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fromZonedTime } from "date-fns-tz"
import { addDays, startOfDay } from "date-fns"

export async function POST() {
  const nowSGT = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" }))
  const tomorrowStart = fromZonedTime(
    startOfDay(addDays(nowSGT, 1)),
    "Asia/Singapore"
  )
  const tomorrowEnd = fromZonedTime(
    startOfDay(addDays(nowSGT, 2)),
    "Asia/Singapore"
  )

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      reminderSent: false,
      scheduledAt: { gte: tomorrowStart, lt: tomorrowEnd },
    },
  })

  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL ?? ""

  for (const appt of appointments) {
    await fetch(`${bookingUrl}/api/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "REMINDER", appointmentId: appt.id }),
    }).catch(console.error)

    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminderSent: true },
    })
  }

  return NextResponse.json({ sent: appointments.length })
}

// Allow Vercel cron (GET)
export { POST as GET }
