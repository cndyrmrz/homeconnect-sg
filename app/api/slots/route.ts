export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAvailableSlots } from "@/lib/slots"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date")
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 })

  const realtor = await prisma.realtor.findFirst()
  if (!realtor) return NextResponse.json({ error: "No realtor" }, { status: 500 })

  const slots = await getAvailableSlots(realtor.id, date)
  return NextResponse.json(slots)
}
