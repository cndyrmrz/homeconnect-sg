const RAILWAY_URL = process.env.RAILWAY_WHATSAPP_URL
const RAILWAY_SECRET = process.env.RAILWAY_WHATSAPP_SECRET

export async function sendWhatsApp(to: string, message: string): Promise<void> {
  if (!RAILWAY_URL || !RAILWAY_SECRET) {
    console.warn("[WhatsApp] Service not configured — skipping send to", to)
    return
  }

  const res = await fetch(`${RAILWAY_URL}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RAILWAY_SECRET}`,
    },
    body: JSON.stringify({ to, message }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("[WhatsApp] Send failed:", res.status, text)
    throw new Error(`WhatsApp send failed: ${res.status}`)
  }
}
