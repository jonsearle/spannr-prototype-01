import { getSingleGarage, getOpeningHoursByGarageId } from '@/lib/supabase/queries'
import OpeningHoursForm from '@/components/admin/OpeningHoursForm'
import { notFound } from 'next/navigation'

export default async function OpeningHoursPage() {
  const garage = await getSingleGarage()

  if (!garage) {
    notFound()
  }

  const initialHours = await getOpeningHoursByGarageId(garage.id)

  return (
    <div className="min-h-screen bg-white">
      {/* Header bar */}
      <div className="bg-gray-200 h-12 flex items-center px-4">
        <svg
          className="w-5 h-5 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Online call back request setttings
        </h1>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Your Opening Days & Hours
        </h2>
        <OpeningHoursForm
          garageId={garage.id}
          initialHours={initialHours}
        />
      </div>
    </div>
  )
}

