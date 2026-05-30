"use client"
import { useState, useEffect } from "react"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"

interface AvailabilityDay {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function SettingsPage() {
  const [availability, setAvailability] = useState<AvailabilityDay[]>(
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      startTime: "09:00",
      endTime: "19:00",
      isActive: i !== 0,
    }))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [waStatus, setWaStatus] = useState<"checking" | "connected" | "disconnected">("checking")

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then((data: AvailabilityDay[]) => {
        if (data.length === 7) setAvailability(data)
      })
      .catch(() => {})

    // Check WhatsApp status
    const railway = process.env.NEXT_PUBLIC_RAILWAY_STATUS_URL
    if (railway) {
      fetch(`${railway}/status`)
        .then((r) => r.json())
        .then((d) => setWaStatus(d.connected ? "connected" : "disconnected"))
        .catch(() => setWaStatus("disconnected"))
    } else {
      setWaStatus("disconnected")
    }
  }, [])

  function updateDay(i: number, patch: Partial<AvailabilityDay>) {
    setAvailability((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))
  }

  async function saveAvailability() {
    setSaving(true)
    await fetch("/api/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(availability),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Working Hours */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h2>
        <div className="space-y-3">
          {availability.map((day, i) => (
            <div key={day.dayOfWeek} className="flex items-center gap-4">
              <div className="w-7 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={day.isActive}
                  onChange={(e) => updateDay(i, { isActive: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600"
                />
              </div>
              <span className={`w-24 text-sm font-medium ${day.isActive ? "text-gray-800" : "text-gray-400"}`}>
                {DAY_NAMES[day.dayOfWeek]}
              </span>
              {day.isActive ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateDay(i, { startTime: e.target.value })}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateDay(i, { endTime: e.target.value })}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400">Off</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Button onClick={saveAvailability} loading={saving}>
            {saved ? "✓ Saved!" : "Save Schedule"}
          </Button>
        </div>
      </Card>

      {/* WhatsApp Status */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Service</h2>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            waStatus === "connected" ? "bg-emerald-500" :
            waStatus === "disconnected" ? "bg-red-400" :
            "bg-amber-400 animate-pulse"
          }`} />
          <span className="text-sm font-medium text-gray-700">
            {waStatus === "connected" ? "Connected" :
             waStatus === "disconnected" ? "Disconnected" :
             "Checking..."}
          </span>
        </div>
        {waStatus === "disconnected" && (
          <p className="text-sm text-gray-500 mt-2">
            Start the WhatsApp service on Railway and scan the QR code to connect.
          </p>
        )}
      </Card>
    </div>
  )
}
