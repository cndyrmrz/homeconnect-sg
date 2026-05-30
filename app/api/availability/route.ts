import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const realtor = await prisma.realtor.findFirst()
  if (!realtor) return NextResponse.json({ error: "No realtor" }, { status: 500 })

  const availability = await prisma.availability.findMany({
    where: { realtorId: realtor.id },
    orderBy: { dayOfWeek: "asc" },
  })
  return NextResponse.json(availability)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const realtor = await prisma.realtor.findFirst()
  if (!realtor) return NextResponse.json({ error: "No realtor" }, { status: 500 })

  const body: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    isActive: boolean
  }> = await req.json()

  const results = await Promise.all(
    body.map((item) =>
      prisma.availability.upsert({
        where: {
          id: `${realtor.id}-day-${item.dayOfWeek}`,
        },
        create: {
          id: `${realtor.id}-day-${item.dayOfWeek}`,
          realtorId: realtor.id,
          ...item,
        },
        update: {
          startTime: item.startTime,
          endTime: item.endTime,
          isActive: item.isActive,
        },
      })
    )
  )

  return NextResponse.json(results)
}
