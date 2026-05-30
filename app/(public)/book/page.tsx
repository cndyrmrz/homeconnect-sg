"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/components/booking/BookingContext"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { APPOINTMENT_TYPE_LABELS, SG_DISTRICTS, validateSGPhone } from "@/lib/utils"

const STEPS = ["Your Details", "Pick a Slot", "Confirm"]

export default function BookPage() {
  const router = useRouter()
  const { data, update } = useBooking()
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!data.clientName.trim()) e.clientName = "Name is required"
    if (!data.clientEmail.trim() || !/\S+@\S+\.\S+/.test(data.clientEmail))
      e.clientEmail = "Valid email required"
    if (!validateSGPhone(data.clientPhone))
      e.clientPhone = "Enter a valid SG number, e.g. +6591234567"
    if (!validateSGPhone(data.clientWhatsapp))
      e.clientWhatsapp = "Enter a valid SG WhatsApp number"
    if (!data.appointmentType) e.appointmentType = "Select appointment type"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (validate()) router.push("/book/slots")
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"}`}>
              {i + 1}
            </div>
            <span className={`text-sm ${i === 0 ? "text-gray-900 font-semibold" : "text-gray-400"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Details</h1>
      <p className="text-gray-500 text-sm mb-6">No account needed — fill in your details below.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <Input
          label="Full Name"
          required
          value={data.clientName}
          onChange={(e) => update({ clientName: e.target.value })}
          error={errors.clientName}
          placeholder="e.g. James Lim"
        />
        <Input
          label="Email Address"
          type="email"
          required
          value={data.clientEmail}
          onChange={(e) => update({ clientEmail: e.target.value })}
          error={errors.clientEmail}
          placeholder="james@email.com"
        />
        <Input
          label="Phone Number"
          required
          value={data.clientPhone}
          onChange={(e) => update({ clientPhone: e.target.value })}
          error={errors.clientPhone}
          placeholder="+6591234567"
          helpText="Singapore mobile number"
        />
        <Input
          label="WhatsApp Number"
          required
          value={data.clientWhatsapp}
          onChange={(e) => update({ clientWhatsapp: e.target.value })}
          error={errors.clientWhatsapp}
          placeholder="+6591234567"
          helpText="We'll send your confirmation here"
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Appointment Type <span className="text-red-500">*</span>
          </label>
          <select
            value={data.appointmentType}
            onChange={(e) => update({ appointmentType: e.target.value })}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.appointmentType ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
          >
            <option value="">Select type...</option>
            {Object.entries(APPOINTMENT_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          {errors.appointmentType && <p className="text-xs text-red-600">{errors.appointmentType}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">District</label>
          <select
            value={data.district}
            onChange={(e) => update({ district: e.target.value })}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Select district (optional)...</option>
            {SG_DISTRICTS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <Input
          label="Property Address"
          value={data.propertyAddress}
          onChange={(e) => update({ propertyAddress: e.target.value })}
          placeholder="e.g. 123 Orchard Road #12-34 (optional)"
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={data.notes}
            onChange={(e) => update({ notes: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="Any special requests or questions? (optional)"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={next}>
          Next: Pick a Slot →
        </Button>
      </div>
    </div>
  )
}
