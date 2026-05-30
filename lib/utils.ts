import { format, toZonedTime } from "date-fns-tz"

export const SGT = "Asia/Singapore"

export function toSGT(date: Date | string): Date {
  return toZonedTime(new Date(date), SGT)
}

export function formatSGT(date: Date | string): string {
  return format(toZonedTime(new Date(date), SGT), "EEE, d MMM yyyy 'at' h:mm a 'SGT'", {
    timeZone: SGT,
  })
}

export function formatDateSGT(date: Date | string): string {
  return format(toZonedTime(new Date(date), SGT), "EEE, d MMM yyyy", { timeZone: SGT })
}

export function formatTimeSGT(date: Date | string): string {
  return format(toZonedTime(new Date(date), SGT), "h:mm a 'SGT'", { timeZone: SGT })
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

export const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  PROPERTY_VIEWING: "Property Viewing",
  BUYER_CONSULTATION: "Buyer Consultation",
  SELLER_CONSULTATION: "Seller Consultation",
  RENTAL_VIEWING: "Rental Viewing",
  OPEN_HOUSE: "Open House",
  FOLLOW_UP: "Follow Up",
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RESCHEDULED: "Rescheduled",
  NO_SHOW: "No Show",
}

export const SG_DISTRICTS = [
  { value: "D1", label: "D1 – Boat Quay / Raffles Place / Marina" },
  { value: "D2", label: "D2 – Chinatown / Tanjong Pagar" },
  { value: "D3", label: "D3 – Alexandra / Commonwealth" },
  { value: "D4", label: "D4 – Harbourfront / Telok Blangah" },
  { value: "D5", label: "D5 – Buona Vista / West Coast / Clementi" },
  { value: "D6", label: "D6 – City Hall / Clarke Quay" },
  { value: "D7", label: "D7 – Beach Road / Bugis / Rochor" },
  { value: "D8", label: "D8 – Farrer Park / Serangoon Rd" },
  { value: "D9", label: "D9 – Orchard / River Valley" },
  { value: "D10", label: "D10 – Bukit Timah / Holland Rd / Tanglin" },
  { value: "D11", label: "D11 – Newton / Novena" },
  { value: "D12", label: "D12 – Balestier / Toa Payoh / Serangoon" },
  { value: "D13", label: "D13 – Macpherson / Braddell" },
  { value: "D14", label: "D14 – Geylang / Eunos" },
  { value: "D15", label: "D15 – Katong / Joo Chiat / Amber Rd" },
  { value: "D16", label: "D16 – Bedok / Upper East Coast" },
  { value: "D17", label: "D17 – Changi / Loyang / Pasir Ris" },
  { value: "D18", label: "D18 – Tampines / Pasir Ris" },
  { value: "D19", label: "D19 – Hougang / Punggol / Sengkang" },
  { value: "D20", label: "D20 – Ang Mo Kio / Bishan / Thomson" },
  { value: "D21", label: "D21 – Clementi Park / Upper Bukit Timah" },
  { value: "D22", label: "D22 – Boon Lay / Jurong / Tuas" },
  { value: "D23", label: "D23 – Bukit Batok / Bukit Panjang / Choa Chu Kang" },
  { value: "D24", label: "D24 – Lim Chu Kang / Tengah" },
  { value: "D25", label: "D25 – Admiralty / Woodlands" },
  { value: "D26", label: "D26 – Mandai / Upper Thomson" },
  { value: "D27", label: "D27 – Sembawang / Yishun" },
  { value: "D28", label: "D28 – Seletar / Yio Chu Kang" },
]

export function validateSGPhone(phone: string): boolean {
  return /^\+65[689]\d{7}$/.test(phone)
}
