import { prisma } from "./prisma"
import { fromZonedTime } from "date-fns-tz"
import { addMinutes, parseISO } from "date-fns"

const SGT = "Asia/Singapore"
const SLOT_DURATION = 60
const BUFFER = 15

export interface Slot {
  time: string
  available: boolean
}

function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

export async function getAvailableSlots(
  realtorId: string,
  dateStr: string
): Promise<Slot[]> {
  const localDate = parseISO(dateStr)
  const dayOfWeek = localDate.getDay()

  const avail = await prisma.availability.findFirst({
    where: { realtorId, dayOfWeek, isActive: true },
  })
  if (!avail) return []

  const startMin = parseTimeToMinutes(avail.startTime)
  const endMin = parseTimeToMinutes(avail.endTime)

  const dayStart = fromZonedTime(
    new Date(`${dateStr}T${avail.startTime}:00`),
    SGT
  )
  const dayEnd = fromZonedTime(
    new Date(`${dateStr}T${avail.endTime}:00`),
    SGT
  )

  const confirmed = await prisma.appointment.findMany({
    where: {
      realtorId,
      status: { in: ["CONFIRMED", "PENDING"] },
      scheduledAt: { gte: dayStart, lt: dayEnd },
    },
  })

  const blocked = await prisma.blockedTime.findMany({
    where: {
      realtorId,
      date: {
        gte: new Date(`${dateStr}T00:00:00Z`),
        lt: new Date(`${dateStr}T23:59:59Z`),
      },
    },
  })

  const slots: Slot[] = []
  let cursor = startMin

  while (cursor + SLOT_DURATION <= endMin) {
    const slotStart = cursor
    const slotEnd = cursor + SLOT_DURATION
    const timeLabel = `${String(Math.floor(slotStart / 60)).padStart(2, "0")}:${String(slotStart % 60).padStart(2, "0")}`

    const slotStartUTC = fromZonedTime(
      new Date(`${dateStr}T${timeLabel}:00`),
      SGT
    )
    let available = true

    for (const appt of confirmed) {
      const apptStart = appt.scheduledAt.getTime()
      const apptEnd = addMinutes(appt.scheduledAt, appt.durationMins + BUFFER).getTime()
      const s = slotStartUTC.getTime()
      const e = addMinutes(slotStartUTC, SLOT_DURATION + BUFFER).getTime()
      if (s < apptEnd && e > apptStart) {
        available = false
        break
      }
    }

    if (available) {
      for (const b of blocked) {
        const bStart = parseTimeToMinutes(b.startTime)
        const bEnd = parseTimeToMinutes(b.endTime)
        if (slotStart < bEnd && slotEnd > bStart) {
          available = false
          break
        }
      }
    }

    slots.push({ time: timeLabel, available })
    cursor += SLOT_DURATION
  }

  return slots
}

export async function isSlotAvailable(
  realtorId: string,
  scheduledAt: Date,
  excludeAppointmentId?: string
): Promise<boolean> {
  const slotEnd = addMinutes(scheduledAt, SLOT_DURATION + BUFFER)

  const conflict = await prisma.appointment.findFirst({
    where: {
      realtorId,
      status: { in: ["CONFIRMED", "PENDING"] },
      id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
      scheduledAt: { lt: slotEnd },
      AND: [
        {
          scheduledAt: {
            gte: addMinutes(scheduledAt, -(SLOT_DURATION + BUFFER)),
          },
        },
      ],
    },
  })
  return !conflict
}
