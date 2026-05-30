"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { formatSGT, APPOINTMENT_TYPE_LABELS } from "@/lib/utils"
import Button from "@/components/ui/Button"
import { format, addDays, startOfDay, parseISO } from "date-fns"

interface Appointment {
  id: string
  clientName: string
  appointmentType: string
  scheduledAt: string
  district?: string
  realtor: { name: string; whatsappNumber: string; phone: string }
}

interface Slot { time: string; available: boolean }

export default function ReschedulePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "invalid" | "maxReached" | "valid">("loading")
  const [reason, setReason] = useState("")
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedTime, setSelectedTime] = useState("")

  useEffect(() => {
    fetch(`/api/reschedule/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.valid) {
          setStatus("valid")
          setAppointment(d.appointment)
        } else if (d.maxReached) {
          setStatus("maxReached")
          setAppointment(d.appointment)
          setReason(d.reason)
        } else {
          setStatus("invalid")
          setReason(d.reason ?? "This link has expired or already been used.")
          setAppointment(d.appointment)
        }
      })
      .catch(() => { setStatus("invalid"); setReason("Unable to validate link.") })
  }, [token])

  useEffect(() => {
    if (!selectedDate) return
    setSlotsLoading(true)
    setSlots([])
    setSelectedTime("")
    fetch(`/api/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then(setSlots)
      .finally(() => setSlotsLoading(false))
  }, [selectedDate])

  const dates = Array.from({ length: 30 }, (_, i) => addDays(startOfDay(new Date()), i))
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  function proceed() {
    if (!selectedDate || !selectedTime) return
    const dt = new Date(`${selectedDate}T${selectedTime}:00+08:00`)
    router.push(`/reschedule/${token}/confirm?new=${dt.toISOString()}`)
  }

  if (status === "loading") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">Validating your link...</p>
      </div>
    )
  }

  if (status === "invalid") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Link Expired</h1>
        <p className="text-gray-500 mb-6">{reason}</p>
        {appointment?.realtor && (
          <a
            href={`https://wa.me/${appointment.realtor.whatsappNumber.replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition"
          >
            💬 Contact {appointment.realtor.name} on WhatsApp
          </a>
        )}
      </div>
    )
  }

  if (status === "maxReached") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Reschedule Limit Reached</h1>
        <p className="text-gray-500 mb-6">
          You have already rescheduled twice. Please contact{" "}
          <strong>{appointment?.realtor?.name}</strong> directly to make further changes.
        </p>
        {appointment?.realtor && (
          <a
            href={`https://wa.me/${appointment.realtor.whatsappNumber.replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition"
          >
            💬 WhatsApp {appointment.realtor.name}
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Reschedule Appointment</h1>
      <p className="text-gray-500 text-sm mb-6">
        Hi {appointment?.clientName}! Pick a new time below.
      </p>

      {/* Current booking */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm">
        <p className="font-semibold text-amber-800 mb-1">Current appointment</p>
        <p className="text-amber-700">
          {APPOINTMENT_TYPE_LABELS[appointment?.appointmentType ?? ""] ?? appointment?.appointmentType}
          {" · "}
          {appointment?.scheduledAt ? formatSGT(appointment.scheduledAt) : ""}
        </p>
      </div>

      {/* Date picker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Select New Date</h2>
        <div className="grid grid-cols-5 gap-2">
          {dates.map((d) => {
            const str = format(d, "yyyy-MM-dd")
            const isSelected = str === selectedDate
            const dow = d.getDay()
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

      {selectedDate && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Available Times for {format(parseISO(selectedDate), "EEE, d MMM yyyy")}
          </h2>
          {slotsLoading && <p className="text-sm text-gray-400 py-4 text-center">Loading...</p>}
          {!slotsLoading && slots.length === 0 && (
            <p className="text-sm text-gray-500 py-4 text-center">No available slots.</p>
          )}
          {!slotsLoading && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((s) => {
                const [h, m] = s.time.split(":").map(Number)
                const ampm = h < 12 ? "AM" : "PM"
                const h12 = h % 12 || 12
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
                    {h12}:{String(m).padStart(2, "0")} {ampm}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <Button size="lg" onClick={proceed} disabled={!selectedDate || !selectedTime} className="w-full">
        Review Reschedule →
      </Button>
    </div>
  )
}
