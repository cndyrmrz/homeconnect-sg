"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/components/booking/BookingContext"
import Button from "@/components/ui/Button"
import { format, addDays, startOfDay, parseISO } from "date-fns"

const STEPS = ["Your Details", "Pick a Slot", "Confirm"]

interface Slot { time: string; available: boolean }

function getDates(n: number): Date[] {
  const dates: Date[] = []
  const today = startOfDay(new Date())
  for (let i = 0; i < n; i++) {
    dates.push(addDays(today, i))
  }
  return dates
}

export default function SlotsPage() {
  const router = useRouter()
  const { data, update } = useBooking()
  const [selectedDate, setSelectedDate] = useState("")
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTime, setSelectedTime] = useState("")

  const dates = getDates(30)

  useEffect(() => {
    if (!data.clientName) router.replace("/book")
  }, [data.clientName, router])

  useEffect(() => {
    if (!selectedDate) return
    setLoading(true)
    setSlots([])
    setSelectedTime("")
    fetch(`/api/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((s) => setSlots(s))
      .finally(() => setLoading(false))
  }, [selectedDate])

  function next() {
    if (!selectedDate || !selectedTime) return
    const dt = new Date(`${selectedDate}T${selectedTime}:00+08:00`)
    update({ scheduledAt: dt.toISOString() })
    router.push("/book/confirm")
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 1 ? "bg-emerald-600 text-white" : i < 1 ? "bg-emerald-200 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>
              {i < 1 ? "✓" : i + 1}
            </div>
            <span className={`text-sm ${i === 1 ? "text-gray-900 font-semibold" : "text-gray-400"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pick a Date & Time</h1>
      <p className="text-gray-500 text-sm mb-6">Each appointment is 60 minutes.</p>

      {/* Date picker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Select Date</h2>
        <div className="grid grid-cols-5 gap-2">
          {dates.slice(0, 30).map((d) => {
            const str = format(d, "yyyy-MM-dd")
            const isSelected = str === selectedDate
            const dow = d.getDay()
            // Sun=0 => visually dim but still selectable (availability from DB)
            return (
              <button
                key={str}
                onClick={() => setSelectedDate(str)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-medium transition border ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50"
                }`}
              >
                <span className="text-[10px] opacity-70">{dayLabels[dow]}</span>
                <span className="text-sm font-bold">{d.getDate()}</span>
                <span className="text-[10px] opacity-70">{monthLabels[d.getMonth()]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Available Times for {format(parseISO(selectedDate), "EEE, d MMM yyyy")}
          </h2>
          {loading && <p className="text-sm text-gray-400 py-4 text-center">Loading slots...</p>}
          {!loading && slots.length === 0 && (
            <p className="text-sm text-gray-500 py-4 text-center">No available slots for this day.</p>
          )}
          {!loading && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((s) => {
                const [h, m] = s.time.split(":").map(Number)
                const ampm = h < 12 ? "AM" : "PM"
                const h12 = h % 12 || 12
                const label = `${h12}:${String(m).padStart(2, "0")} ${ampm}`
                return (
                  <button
                    key={s.time}
                    disabled={!s.available}
                    onClick={() => setSelectedTime(s.time)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                      !s.available
                        ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                        : selectedTime === s.time
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50"
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => router.back()}>← Back</Button>
        <Button onClick={next} disabled={!selectedDate || !selectedTime}>
          Next: Review →
        </Button>
      </div>
    </div>
  )
}
