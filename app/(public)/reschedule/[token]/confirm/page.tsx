"use client"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { formatSGT, APPOINTMENT_TYPE_LABELS } from "@/lib/utils"
import Button from "@/components/ui/Button"

interface Appointment {
  clientName: string
  appointmentType: string
  scheduledAt: string
  realtor: { name: string; phone: string }
}

function ConfirmContent() {
  const { token } = useParams<{ token: string }>()
  const params = useSearchParams()
  const router = useRouter()
  const newISO = params.get("new") ?? ""
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/reschedule/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.valid) setAppointment(d.appointment)
        else router.replace(`/reschedule/${token}`)
      })
  }, [token, router])

  async function confirm() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/reschedule/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newScheduledAt: newISO }),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? "Reschedule failed")
      }
      router.push("/reschedule/success")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (!appointment) {
    return <div className="py-20 text-center text-gray-400">Loading...</div>
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Confirm Reschedule</h1>
      <p className="text-gray-500 text-sm mb-6">Please review the time change before confirming.</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 mb-6">
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current time</p>
          <p className="text-sm font-medium text-gray-700 line-through">{formatSGT(appointment.scheduledAt)}</p>
        </div>
        <div className="px-5 py-4 bg-emerald-50">
          <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">New time</p>
          <p className="text-base font-bold text-emerald-700">{formatSGT(newISO)}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Appointment</p>
          <p className="text-sm font-medium text-gray-700">
            {APPOINTMENT_TYPE_LABELS[appointment.appointmentType] ?? appointment.appointmentType}
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Realtor</p>
          <p className="text-sm font-medium text-gray-700">
            {appointment.realtor.name} · {appointment.realtor.phone}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => router.back()} className="flex-1">← Back</Button>
        <Button loading={loading} onClick={confirm} className="flex-1">
          Confirm Reschedule ✓
        </Button>
      </div>
    </div>
  )
}

export default function RescheduleConfirmPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading...</div>}>
      <ConfirmContent />
    </Suspense>
  )
}
