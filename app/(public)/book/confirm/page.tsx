"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/components/booking/BookingContext"
import Button from "@/components/ui/Button"
import { APPOINTMENT_TYPE_LABELS, SG_DISTRICTS, formatSGT } from "@/lib/utils"

const STEPS = ["Your Details", "Pick a Slot", "Confirm"]

export default function ConfirmPage() {
  const router = useRouter()
  const { data, reset } = useBooking()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!data.clientName || !data.scheduledAt) router.replace("/book")
  }, [data.clientName, data.scheduledAt, router])

  const districtLabel = SG_DISTRICTS.find((d) => d.value === data.district)?.label ?? data.district

  async function submit() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? "Booking failed")
      }
      const appt = await res.json()
      reset()
      router.push(`/book/success?id=${appt.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 2 ? "bg-emerald-600 text-white" : "bg-emerald-200 text-emerald-700"}`}>
              {i < 2 ? "✓" : i + 1}
            </div>
            <span className={`text-sm ${i === 2 ? "text-gray-900 font-semibold" : "text-gray-400"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Review Your Booking</h1>
      <p className="text-gray-500 text-sm mb-6">Please check the details below before confirming.</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        <Row label="Name" value={data.clientName} />
        <Row label="Email" value={data.clientEmail} />
        <Row label="Phone" value={data.clientPhone} />
        <Row label="WhatsApp" value={data.clientWhatsapp} />
        <Row label="Appointment Type" value={APPOINTMENT_TYPE_LABELS[data.appointmentType] ?? data.appointmentType} />
        {data.district && <Row label="District" value={districtLabel} />}
        {data.propertyAddress && <Row label="Property" value={data.propertyAddress} />}
        {data.scheduledAt && <Row label="Date & Time" value={formatSGT(data.scheduledAt)} highlight />}
        {data.notes && <Row label="Notes" value={data.notes} />}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={() => router.back()}>← Back</Button>
        <Button size="lg" loading={loading} onClick={submit}>
          Confirm Booking ✓
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-start px-5 py-3.5 gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right ${highlight ? "text-emerald-700 font-semibold" : "text-gray-800"}`}>
        {value}
      </span>
    </div>
  )
}
