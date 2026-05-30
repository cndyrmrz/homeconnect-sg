export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 mt-16">
      <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} HomeConnect SG. All rights reserved.</p>
        <p className="mt-1">Powered by PropNex Realty · CEA Licensed</p>
      </div>
    </footer>
  )
}
