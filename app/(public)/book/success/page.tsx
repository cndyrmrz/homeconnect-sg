"use client"
import { Suspense } from "react"
import Link from "next/link"

function SuccessContent() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Booking Received!</h1>
      <p className="text-gray-500 mb-8 max-w-sm mx-auto">
        Your appointment request has been submitted. You will receive a WhatsApp message shortly to confirm.
      </p>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-left mb-8">
        <h2 className="text-sm font-semibold text-emerald-800 mb-3 uppercase tracking-wider">What happens next?</h2>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">1.</span>
            The realtor will review your request and confirm within a few hours.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">2.</span>
            You&apos;ll receive a WhatsApp confirmation with appointment details.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">3.</span>
            A reminder will be sent the day before your appointment.
          </li>
        </ul>
      </div>

      <Link
        href="/"
        className="inline-flex items-center text-emerald-700 font-semibold hover:text-emerald-800 transition text-sm"
      >
        ← Back to Home
      </Link>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
