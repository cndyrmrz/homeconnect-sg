import { PrismaClient, AppointmentType, AppointmentStatus } from "@prisma/client"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

const prisma = new PrismaClient()

function token() {
  return randomBytes(32).toString("hex")
}

function expiry() {
  const d = new Date()
  d.setHours(d.getHours() + 48)
  return d
}

async function main() {
  const password = await bcrypt.hash("password123", 12)

  const realtor = await prisma.realtor.upsert({
    where: { email: "sarah@propnex.com" },
    update: {},
    create: {
      name: "Sarah Tan",
      email: "sarah@propnex.com",
      password,
      phone: "+6591234567",
      whatsappNumber: "+6591234567",
      ceaNo: "R012345A",
      agencyName: "PropNex Realty",
      bio: "Hi, I'm Sarah! With over 10 years of experience in Singapore's property market, I specialise in residential sales and rentals across Districts 9, 10, and 15. Let me help you find your dream home.",
    },
  })

  // Seed availability Mon–Sat 09:00–19:00, Sunday off
  const days = [
    { dayOfWeek: 0, startTime: "09:00", endTime: "19:00", isActive: false }, // Sun
    { dayOfWeek: 1, startTime: "09:00", endTime: "19:00", isActive: true },
    { dayOfWeek: 2, startTime: "09:00", endTime: "19:00", isActive: true },
    { dayOfWeek: 3, startTime: "09:00", endTime: "19:00", isActive: true },
    { dayOfWeek: 4, startTime: "09:00", endTime: "19:00", isActive: true },
    { dayOfWeek: 5, startTime: "09:00", endTime: "19:00", isActive: true },
    { dayOfWeek: 6, startTime: "09:00", endTime: "19:00", isActive: true }, // Sat
  ]

  for (const day of days) {
    await prisma.availability.upsert({
      where: { id: `${realtor.id}-day-${day.dayOfWeek}` },
      update: day,
      create: { id: `${realtor.id}-day-${day.dayOfWeek}`, realtorId: realtor.id, ...day },
    })
  }

  const now = new Date()
  const d = (offset: number) => {
    const dt = new Date(now)
    dt.setDate(dt.getDate() + offset)
    dt.setHours(10, 0, 0, 0)
    return dt
  }

  await prisma.appointment.createMany({
    skipDuplicates: true,
    data: [
      {
        realtorId: realtor.id,
        clientName: "James Lim",
        clientEmail: "james@email.com",
        clientPhone: "+6598765432",
        clientWhatsapp: "+6598765432",
        district: "D10",
        appointmentType: AppointmentType.PROPERTY_VIEWING,
        status: AppointmentStatus.PENDING,
        scheduledAt: d(2),
      },
      {
        realtorId: realtor.id,
        clientName: "Mei Ling",
        clientEmail: "meiling@email.com",
        clientPhone: "+6587654321",
        clientWhatsapp: "+6587654321",
        district: "D9",
        appointmentType: AppointmentType.BUYER_CONSULTATION,
        status: AppointmentStatus.CONFIRMED,
        scheduledAt: d(3),
        rescheduleToken: token(),
        rescheduleExpiry: expiry(),
      },
      {
        realtorId: realtor.id,
        clientName: "Rajan Pillai",
        clientEmail: "rajan@email.com",
        clientPhone: "+6576543210",
        clientWhatsapp: "+6576543210",
        district: "D15",
        appointmentType: AppointmentType.RENTAL_VIEWING,
        status: AppointmentStatus.CONFIRMED,
        scheduledAt: d(5),
        rescheduleCount: 1,
        rescheduleToken: token(),
        rescheduleExpiry: expiry(),
      },
      {
        realtorId: realtor.id,
        clientName: "Priya Sharma",
        clientEmail: "priya@email.com",
        clientPhone: "+6565432109",
        clientWhatsapp: "+6565432109",
        district: "D11",
        appointmentType: AppointmentType.SELLER_CONSULTATION,
        status: AppointmentStatus.COMPLETED,
        scheduledAt: d(-1),
      },
      {
        realtorId: realtor.id,
        clientName: "David Koh",
        clientEmail: "david@email.com",
        clientPhone: "+6554321098",
        clientWhatsapp: "+6554321098",
        district: "D20",
        appointmentType: AppointmentType.FOLLOW_UP,
        status: AppointmentStatus.CANCELLED,
        scheduledAt: d(-7),
      },
    ],
  })

  console.log("Seed complete. Login: sarah@propnex.com / password123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
