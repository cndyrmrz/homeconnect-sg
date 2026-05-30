import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendWhatsApp } from "@/lib/whatsapp"
import { getRescheduleUrl } from "@/lib/reschedule"
import { formatSGT } from "@/lib/utils"
import { APPOINTMENT_TYPE_LABELS } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const { type, appointmentId } = await req.json()

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { realtor: true },
  })
  if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const r = appointment.realtor
  const typeLabel = APPOINTMENT_TYPE_LABELS[appointment.appointmentType] ?? appointment.appointmentType
  const dateStr = formatSGT(appointment.scheduledAt)
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL ?? ""
  const location = appointment.propertyAddress ?? appointment.district ?? "TBC"

  let realtorMsg = ""
  let clientMsg = ""

  if (type === "NEW_BOOKING") {
    realtorMsg = `Hi ${r.name}! New appointment request:\n\nClient: ${appointment.clientName}\nType: ${typeLabel}\nDate: ${dateStr}\nProperty: ${location}\nContact: ${appointment.clientPhone}\n\nLog in to confirm: ${bookingUrl}/login`
    clientMsg = `Hi ${appointment.clientName}! Thank you for booking with ${r.name}.\n\nYour request has been received:\nDate: ${dateStr}\nType: ${typeLabel}\n\nWe will confirm your appointment shortly.\nQuestions? Reply to this message.`
  } else if (type === "BOOKING_CONFIRMED") {
    const rescheduleUrl = appointment.rescheduleToken
      ? getRescheduleUrl(appointment.rescheduleToken)
      : null
    clientMsg = `Hi ${appointment.clientName}! Your appointment is confirmed:\n\nDate: ${dateStr}\nType: ${typeLabel}\nRealtor: ${r.name} (${r.phone})\n\nNeed to reschedule? Tap here (valid 48 hrs):\n${rescheduleUrl}\n\nSee you then!`
  } else if (type === "BOOKING_CANCELLED") {
    clientMsg = `Hi ${appointment.clientName}, your appointment on ${dateStr} has been cancelled.\n\nTo rebook: ${bookingUrl}\nSorry for the inconvenience.`
  } else if (type === "BOOKING_RESCHEDULED") {
    const oldDateStr = appointment.previousScheduledAt
      ? formatSGT(appointment.previousScheduledAt)
      : "N/A"
    const newRescheduleUrl =
      appointment.rescheduleCount < 2 && appointment.rescheduleToken
        ? getRescheduleUrl(appointment.rescheduleToken)
        : null

    const changeAgainLine =
      newRescheduleUrl
        ? `\nNeed to change again? Tap here (valid 48 hrs):\n${newRescheduleUrl}`
        : ""

    clientMsg = `Hi ${appointment.clientName}, your appointment has been rescheduled:\n\nOld time: ${oldDateStr}\nNew time: ${dateStr}\nRealtor: ${r.name} (${r.phone})${changeAgainLine}`
    realtorMsg = `Hi ${r.name}, ${appointment.clientName} has rescheduled:\n\nOld time: ${oldDateStr}\nNew time: ${dateStr}\nProperty: ${location}\nClient: ${appointment.clientPhone}`
  } else if (type === "REMINDER") {
    clientMsg = `Reminder: You have an appointment tomorrow!\n\nDate: ${dateStr}\nType: ${typeLabel}\nRealtor: ${r.name} (${r.phone})`
    realtorMsg = `Reminder: Appointment tomorrow with ${appointment.clientName}.\n\nDate: ${dateStr}\nType: ${typeLabel}\nProperty: ${location}\nClient: ${appointment.clientPhone}`
  }

  const sends: Promise<void>[] = []
  if (clientMsg) sends.push(sendWhatsApp(appointment.clientWhatsapp, clientMsg))
  if (realtorMsg) sends.push(sendWhatsApp(r.whatsappNumber, realtorMsg))

  await Promise.allSettled(sends)

  return NextResponse.json({ success: true })
}
