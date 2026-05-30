require("dotenv").config()
const express = require("express")
const { Client, LocalAuth } = require("whatsapp-web.js")
const qrcode = require("qrcode-terminal")

const app = express()
app.use(express.json())

const SECRET = process.env.WHATSAPP_SECRET
const PORT = process.env.PORT || 3001

let isConnected = false

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
})

client.on("qr", (qr) => {
  console.log("Scan this QR code with WhatsApp:")
  qrcode.generate(qr, { small: true })
})

client.on("ready", () => {
  console.log("WhatsApp client ready")
  isConnected = true
})

client.on("disconnected", () => {
  console.log("WhatsApp client disconnected")
  isConnected = false
})

client.initialize()

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || auth !== `Bearer ${SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  next()
}

const SG_PHONE_RE = /^\+65[689]\d{7}$/

app.get("/health", (req, res) => res.json({ status: "ok" }))
app.get("/status", (req, res) => res.json({ connected: isConnected }))

app.post("/send", authMiddleware, async (req, res) => {
  const { to, message } = req.body
  if (!to || !message) {
    return res.status(400).json({ error: "to and message required" })
  }
  if (!SG_PHONE_RE.test(to)) {
    return res.status(400).json({ error: "Invalid SG phone number" })
  }
  if (!isConnected) {
    return res.status(503).json({ error: "WhatsApp not connected" })
  }

  try {
    const chatId = to.replace("+", "") + "@c.us"
    await client.sendMessage(chatId, message)
    res.json({ success: true })
  } catch (err) {
    console.error("Send error:", err)
    res.status(500).json({ error: "Failed to send message" })
  }
})

app.listen(PORT, () => console.log(`WhatsApp service running on port ${PORT}`))
