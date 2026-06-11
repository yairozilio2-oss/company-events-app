import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">פורטל עובדים</h1>
      <div className="flex gap-4">
        <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
          התחברות
        </Link>
        <Link href="/preferences" className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700">
          העדפות חדרים
        </Link>
        <Link href="/admin" className="px-6 py-2 bg-slate-800 text-slate-100 rounded shadow hover:bg-slate-700">
          ממשק מנהל
        </Link>
      </div>
    </main>
  )
}
