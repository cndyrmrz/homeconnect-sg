"use client"
import { useState, useEffect, useCallback } from "react"
import Badge, { STATUS_VARIANT } from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { formatSGT, APPOINTMENT_TYPE_LABELS, STATUS_LABELS } from "@/lib/utils"

const STATUS_TABS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]

interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientWhatsapp: string
  appointmentType: string
  status: string
  scheduledAt: string
  previousScheduledAt?: string
  district?: string
  propertyAddress?: string
  notes?: string
  rescheduleCount: number
  rescheduleToken?: string
  rescheduleExpiry?: string
  realtor: { name: string; phone: string }
}

export default function BookingsPage() {
  const [tab, setTab] = useState("ALL")
  const [search, setSearch] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rescheduleUrl, setRescheduleUrl] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    const qs = tab !== "ALL" ? `?status=${tab}` : ""
    fetch(`/api/bookings${qs}`)
      .then((r) => r.json())
      .then(setAppointments)
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => { load() }, [load])

  const filtered = appointments.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.clientName.toLowerCase().includes(q) ||
      a.clientPhone.includes(q)
    )
  })

  async function updateStatus(id: string, status: string, scheduledAt?: string) {
    setActionLoading(true)
    const body: Record<string, string> = { status }
    if (scheduledAt) body.scheduledAt = scheduledAt
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setActionLoading(false)
    setSelected(null)
    load()
  }

  async function generateRescheduleLink(id: string) {
    setActionLoading(true)
    const res = await fetch(`/api/bookings/${id}/reschedule-link`, { method: "POST" })
    const data = await res.json()
    setRescheduleUrl(data.rescheduleUrl)
    setActionLoading(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bookings</h1>

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                tab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "ALL" ? "All" : STATUS_LABELS[t]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400">No appointments found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => { setSelected(a); setRescheduleUrl("") }}
              className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:border-emerald-300 transition text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{a.clientName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {APPOINTMENT_TYPE_LABELS[a.appointmentType]} · {formatSGT(a.scheduledAt)}
                </p>
                <p className="text-xs text-gray-400">{a.clientPhone}</p>
              </div>
              <Badge label={STATUS_LABELS[a.status]} variant={STATUS_VARIANT[a.status]} />
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Appointment Details" className="max-w-xl">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Name" value={selected.clientName} />
              <Detail label="Email" value={selected.clientEmail} />
              <Detail label="Phone" value={selected.clientPhone} />
              <Detail label="WhatsApp" value={selected.clientWhatsapp} />
              <Detail label="Type" value={APPOINTMENT_TYPE_LABELS[selected.appointmentType]} />
              <Detail label="Status" value={STATUS_LABELS[selected.status]} />
              <Detail label="Scheduled" value={formatSGT(selected.scheduledAt)} />
              {selected.district && <Detail label="District" value={selected.district} />}
              {selected.propertyAddress && <Detail label="Property" value={selected.propertyAddress} />}
            </div>

            {selected.notes && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                <p className="text-xs font-medium text-gray-400 mb-1">Notes</p>
                {selected.notes}
              </div>
            )}

            {/* Reschedule history */}
            <div className="bg-amber-50 rounded-xl p-3 text-sm">
              <p className="text-xs font-medium text-amber-700 mb-1">
                Rescheduled {selected.rescheduleCount} time(s)
              </p>
              {selected.previousScheduledAt && (
                <p className="text-amber-600 text-xs">
                  Previously: {formatSGT(selected.previousScheduledAt)}
                </p>
              )}
              {selected.rescheduleToken && (
                <p className="text-amber-600 text-xs mt-1">
                  Link expires: {selected.rescheduleExpiry ? formatSGT(selected.rescheduleExpiry) : "N/A"}
                </p>
              )}
            </div>

            {/* Reschedule link */}
            <div>
              <Button
                variant="secondary"
                size="sm"
                loading={actionLoading}
                onClick={() => generateRescheduleLink(selected.id)}
              >
                Generate New Reschedule Link
              </Button>
              {rescheduleUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    readOnly
                    value={rescheduleUrl}
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(rescheduleUrl)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 border border-emerald-200 rounded-lg"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              {selected.status === "PENDING" && (
                <Button
                  size="sm"
                  loading={actionLoading}
                  onClick={() => updateStatus(selected.id, "CONFIRMED")}
                >
                  ✓ Confirm
                </Button>
              )}
              {(selected.status === "PENDING" || selected.status === "CONFIRMED") && (
                <Button
                  variant="danger"
                  size="sm"
                  loading={actionLoading}
                  onClick={() => updateStatus(selected.id, "CANCELLED")}
                >
                  Cancel
                </Button>
              )}
              {selected.status === "CONFIRMED" && (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={actionLoading}
                  onClick={() => updateStatus(selected.id, "COMPLETED")}
                >
                  Mark Completed
                </Button>
              )}
              {selected.status === "CONFIRMED" && (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={actionLoading}
                  onClick={() => updateStatus(selected.id, "NO_SHOW")}
                >
                  No Show
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  )
}
