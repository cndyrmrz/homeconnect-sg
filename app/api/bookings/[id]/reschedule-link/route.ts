import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateRescheduleToken, getTokenExpiry, getRescheduleUrl } from "@/lib/reschedule"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const token = generateRescheduleToken()
  const expiry = getTokenExpiry()

  await prisma.appointment.update({
    where: { id: params.id },
    data: { rescheduleToken: token, rescheduleExpiry: expiry },
  })

  return NextResponse.json({ rescheduleUrl: getRescheduleUrl(token) })
}
