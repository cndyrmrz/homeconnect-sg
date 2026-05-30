import Link from "next/link"

export default function RescheduleSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Appointment Rescheduled!</h1>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Your appointment has been successfully rescheduled. You will receive a WhatsApp confirmation shortly.
      </p>
      <Link
        href="/"
        className="inline-flex items-center text-emerald-700 font-semibold hover:text-emerald-800 transition text-sm"
      >
        ← Back to Home
      </Link>
    </div>
  )
}
