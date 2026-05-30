"use client"
import { createContext, useContext, useState, ReactNode } from "react"

export interface BookingFormData {
  clientName: string
  clientEmail: string
  clientPhone: string
  clientWhatsapp: string
  appointmentType: string
  district: string
  propertyAddress: string
  notes: string
  scheduledAt: string
}

const defaultData: BookingFormData = {
  clientName: "",
  clientEmail: "",
  clientPhone: "+65",
  clientWhatsapp: "+65",
  appointmentType: "",
  district: "",
  propertyAddress: "",
  notes: "",
  scheduledAt: "",
}

interface BookingContextType {
  data: BookingFormData
  update: (patch: Partial<BookingFormData>) => void
  reset: () => void
}

const BookingContext = createContext<BookingContextType | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BookingFormData>(defaultData)
  const update = (patch: Partial<BookingFormData>) =>
    setData((prev) => ({ ...prev, ...patch }))
  const reset = () => setData(defaultData)
  return (
    <BookingContext.Provider value={{ data, update, reset }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error("useBooking must be inside BookingProvider")
  return ctx
}
