import { getUnreadCount } from '../lib/emailUtils'

export default function FolderItem({ folder, emails, isActive, onClick }) {
  const unreadCount = getUnreadCount(emails, folder.id)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2 text-left rounded-md transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700 font-semibold'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg">{folder.icon}</span>
        <span>{folder.name}</span>
      </div>
      {unreadCount > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
        }`}>
          {unreadCount}
        </span>
      )}
    </button>
  )
}

