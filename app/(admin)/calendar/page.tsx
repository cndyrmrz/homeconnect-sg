"use client"
import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, parseISO } from "date-fns"
import Badge, { STATUS_VARIANT } from "@/components/ui/Badge"
import { formatSGT, APPOINTMENT_TYPE_LABELS, STATUS_LABELS } from "@/lib/utils"

interface Appointment {
  id: string
  clientName: string
  appointmentType: string
  status: string
  scheduledAt: string
}

const DOT_COLOR: Record<string, string> = {
  CONFIRMED: "bg-emerald-500",
  PENDING: "bg-amber-400",
  CANCELLED: "bg-red-400",
  COMPLETED: "bg-blue-400",
  RESCHEDULED: "bg-purple-400",
  NO_SHOW: "bg-gray-400",
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then(setAppointments)
  }, [])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const apptsByDay: Record<string, Appointment[]> = {}
  for (const a of appointments) {
    const key = format(new Date(a.scheduledAt), "yyyy-MM-dd")
    if (!apptsByDay[key]) apptsByDay[key] = []
    apptsByDay[key].push(a)
  }

  const dayAppts = selectedDay ? (apptsByDay[selectedDay] ?? []) : []
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
          >
            ‹
          </button>
          <span className="font-semibold text-gray-700 w-36 text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
          >
            ›
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS.map((d) => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase">
              {d}
            </div>
          ))}
        </div>
        {/* Cells */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd")
            const dayApptList = apptsByDay[key] ?? []
            const inMonth = isSameMonth(day, currentMonth)
            const selected = key === selectedDay
            return (
              <button
                key={key}
                onClick={() => setSelectedDay(selected ? null : key)}
                className={`min-h-[70px] p-2 text-left border-b border-r border-gray-50 transition ${
                  selected ? "bg-emerald-50" : inMonth ? "hover:bg-gray-50" : "bg-gray-50/50"
                }`}
              >
                <span className={`text-sm font-medium ${
                  isToday(day)
                    ? "w-6 h-6 bg-emerald-600 text-white rounded-full inline-flex items-center justify-center text-xs"
                    : inMonth
                    ? "text-gray-700"
                    : "text-gray-300"
                }`}>
                  {format(day, "d")}
                </span>
                {dayApptList.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dayApptList.slice(0, 3).map((a) => (
                      <span
                        key={a.id}
                        className={`w-2 h-2 rounded-full ${DOT_COLOR[a.status] ?? "bg-gray-400"}`}
                      />
                    ))}
                    {dayApptList.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{dayApptList.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day detail */}
      {selectedDay && (
        <div>
          <h2 className="font-semibold text-gray-800 mb-3">
            {format(parseISO(selectedDay), "EEEE, d MMMM yyyy")}
          </h2>
          {dayAppts.length === 0 ? (
            <p className="text-gray-400 text-sm">No appointments on this day.</p>
          ) : (
            <div className="space-y-2">
              {dayAppts
                .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                .map((a) => (
                  <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${DOT_COLOR[a.status] ?? "bg-gray-400"}`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{a.clientName}</p>
                      <p className="text-xs text-gray-500">
                        {APPOINTMENT_TYPE_LABELS[a.appointmentType]} · {formatSGT(a.scheduledAt)}
                      </p>
                    </div>
                    <Badge label={STATUS_LABELS[a.status]} variant={STATUS_VARIANT[a.status]} />
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-500">
        {Object.entries(DOT_COLOR).map(([s, color]) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {STATUS_LABELS[s]}
          </div>
        ))}
      </div>
    </div>
  )
}
