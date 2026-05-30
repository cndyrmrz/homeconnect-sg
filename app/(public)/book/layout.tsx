import { BookingProvider } from "@/components/booking/BookingContext"

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <BookingProvider>{children}</BookingProvider>
}
