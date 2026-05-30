# HomeConnect SG

Singapore Realtor Appointment Booking App — full-stack Next.js 14 with WhatsApp notifications and client self-reschedule via secure link.

## Features

- Public landing page with realtor profile
- 3-step client booking flow (no login required)
- WhatsApp notifications for every booking event (new, confirmed, cancelled, rescheduled, reminder)
- Client self-reschedule via secure token link (max 2 reschedules, 48h expiry)
- Admin dashboard: stats, upcoming appointments, calendar, bookings list
- Realtor login (NextAuth.js)
- Daily reminder cron job (Vercel Cron, runs 08:00 SGT)
- Singapore-specific: 28 districts, SGT timezone, SG phone validation, CEA number

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Database | PostgreSQL via Vercel Postgres + Prisma 7 ORM |
| Auth | NextAuth.js v5 (beta) |
| WhatsApp | whatsapp-web.js on Railway.app |
| Deploy | Vercel (frontend) + Railway (WhatsApp bot) |

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Vercel Postgres → Settings → Connection String (Pooled) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` for dev |
| `RAILWAY_WHATSAPP_URL` | Railway service URL after deploy |
| `RAILWAY_WHATSAPP_SECRET` | Any random string, same as Railway env var |
| `NEXT_PUBLIC_BOOKING_URL` | `http://localhost:3000` for dev |

### 3. Set up the database

```bash
# Push schema to Postgres
npx prisma db push

# Seed with sample data (creates Sarah Tan + 5 appointments)
npm run db:seed
```

Seed login: `sarah@propnex.com` / `password123`

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## WhatsApp Service (Railway)

### Local test

```bash
cd whatsapp-service
npm install
WHATSAPP_SECRET=your_secret node index.js
```

Scan the QR code printed in terminal with your WhatsApp mobile app. The service runs on port 3001.

### Deploy to Railway

1. Create a new Railway project → New Service → GitHub Repo (point to the `whatsapp-service/` subfolder)
2. Set environment variables in Railway:
   - `WHATSAPP_SECRET` — same value as `RAILWAY_WHATSAPP_SECRET` in Vercel
3. The `Dockerfile` handles Chromium for Puppeteer.
4. On first deploy, check Railway logs for the QR code, scan once. Session persists via `LocalAuth`.
5. Copy the Railway public URL to Vercel as `RAILWAY_WHATSAPP_URL`.

---

## Vercel Deploy

```bash
npm i -g vercel
vercel
```

Set all environment variables in the Vercel dashboard. The cron job (`/api/reminder`) runs daily at 00:00 UTC (08:00 SGT) via `vercel.json`.

---

## Database Commands

```bash
npm run db:push      # push schema changes (no migration file)
npm run db:migrate   # create migration file + apply
npm run db:seed      # seed sample data
npm run db:studio    # open Prisma Studio GUI
```

---

## Admin Portal

Route: `/login` → `/dashboard`

| Page | URL |
|---|---|
| Dashboard | /dashboard |
| Bookings | /bookings |
| Calendar | /calendar |
| Settings | /settings |

Confirm a booking to generate a reschedule token and send the client a WhatsApp with the link.

---

## Reschedule Flow

1. Realtor confirms booking → token generated, client receives WhatsApp with `/reschedule/<token>`
2. Client opens link → picks new date/time → confirms
3. Both parties notified via WhatsApp
4. New token issued if rescheduleCount < 2
5. After 2 reschedules or 48h expiry, client is directed to contact realtor directly

Realtor can always generate a fresh link from the bookings detail modal.

---

## Project Structure

```
app/
  (public)/         Landing, booking flow, reschedule flow
  (admin)/          Login, dashboard, bookings, calendar, settings
  api/              All API routes

lib/                prisma, auth, slots, reschedule, whatsapp, utils
components/         ui/, booking/, reschedule/, admin/, layout/
prisma/             schema.prisma, seed.ts
whatsapp-service/   Express + whatsapp-web.js (deploy to Railway)
```
