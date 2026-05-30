import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { APPOINTMENT_TYPE_LABELS } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function LandingPage() {
  const realtor = await prisma.realtor.findFirst()

  if (!realtor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Setting up... please run the seed script.</p>
      </div>
    )
  }

  const services = Object.entries(APPOINTMENT_TYPE_LABELS)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="flex flex-col md:flex-row items-center gap-10 mb-14">
        <div className="flex-shrink-0">
          {realtor.photoUrl ? (
            <img
              src={realtor.photoUrl}
              alt={realtor.name}
              className="w-40 h-40 rounded-2xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-40 h-40 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-lg">
              <span className="text-5xl text-emerald-600 font-bold">
                {realtor.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-1">
            {realtor.agencyName}
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{realtor.name}</h1>
          {realtor.ceaNo && (
            <p className="text-sm text-gray-500 mb-3">CEA No: {realtor.ceaNo}</p>
          )}
          {realtor.bio && (
            <p className="text-gray-600 leading-relaxed max-w-xl">{realtor.bio}</p>
          )}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Link
              href="/book"
              className="inline-flex items-center justify-center bg-emerald-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-emerald-700 transition text-base shadow-md hover:shadow-lg"
            >
              📅 Book an Appointment
            </Link>
            <a
              href={`https://wa.me/${realtor.whatsappNumber.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-white border border-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition text-base"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Services Offered</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {services.map(([key, label]) => (
            <div
              key={key}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-emerald-600 rounded-3xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to find your dream home?</h2>
        <p className="text-emerald-100 mb-6 max-w-md mx-auto">
          Book a free consultation today. Same-day appointments available.
        </p>
        <Link
          href="/book"
          className="inline-flex items-center bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition shadow"
        >
          Book Now — It's Free
        </Link>
      </div>
    </div>
  )
}
