interface OpenStatusBadgeProps {
  isOpen: boolean
}

export default function OpenStatusBadge({ isOpen }: OpenStatusBadgeProps) {
  return (
    <div className="fixed top-4 left-4 z-50">
      <div
        className={`px-4 py-2 rounded-lg shadow-lg ${
          isOpen ? 'bg-gray-800' : 'bg-gray-800'
        }`}
      >
        <p className="text-white font-bold text-lg">
          {isOpen ? "We're open" : "We're closed"}
        </p>
      </div>
    </div>
  )
}

