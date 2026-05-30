import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import Badge, { STATUS_VARIANT } from "@/components/ui/Badge"
import { formatSGT, APPOINTMENT_TYPE_LABELS, STATUS_LABELS } from "@/lib/utils"
import { startOfDay, endOfDay, addDays, startOfMonth, endOfMonth } from "date-fns"
import { fromZonedTime } from "date-fns-tz"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  const realtor = await prisma.realtor.findFirst()
  if (!realtor) return null

  const nowSGT = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" }))
  const todayStart = fromZonedTime(startOfDay(nowSGT), "Asia/Singapore")
  const todayEnd = fromZonedTime(endOfDay(nowSGT), "Asia/Singapore")
  const weekEnd = fromZonedTime(endOfDay(addDays(nowSGT, 6)), "Asia/Singapore")
  const monthStart = fromZonedTime(startOfMonth(nowSGT), "Asia/Singapore")
  const monthEnd = fromZonedTime(endOfMonth(nowSGT), "Asia/Singapore")

  const [todayCount, pendingCount, weekCount, completedCount, upcoming] = await Promise.all([
    prisma.appointment.count({
      where: { realtorId: realtor.id, scheduledAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.appointment.count({ where: { realtorId: realtor.id, status: "PENDING" } }),
    prisma.appointment.count({
      where: {
        realtorId: realtor.id,
        scheduledAt: { gte: todayStart, lte: weekEnd },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    }),
    prisma.appointment.count({
      where: {
        realtorId: realtor.id,
        status: "COMPLETED",
        scheduledAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.appointment.findMany({
      where: {
        realtorId: realtor.id,
        scheduledAt: { gte: todayStart, lte: weekEnd },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    }),
  ])

  const stats = [
    { label: "Today", value: todayCount, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: pendingCount, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "This Week", value: weekCount, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Completed (Month)", value: completedCount, color: "text-purple-600", bg: "bg-purple-50" },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {session?.user?.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming (7 days)</h2>
          <Link href="/bookings" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View all →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            No upcoming appointments.
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((appt) => (
              <div key={appt.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{appt.clientName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {APPOINTMENT_TYPE_LABELS[appt.appointmentType]} · {formatSGT(appt.scheduledAt)}
                  </p>
                </div>
                <Badge
                  label={STATUS_LABELS[appt.status]}
                  variant={STATUS_VARIANT[appt.status]}
                />
                <QuickActions id={appt.id} status={appt.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function QuickActions({ id }: { id: string }) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Link
        href={`/bookings/${id}`}
        className="text-xs text-gray-500 hover:text-emerald-600 border border-gray-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition"
      >
        View
      </Link>
    </div>
  )
}
