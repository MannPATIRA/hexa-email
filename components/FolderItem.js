import { getUnreadCount } from '../lib/emailUtils'

export default function FolderItem({ folder, emails, isActive, onClick, isChild = false }) {
  // Always calculate count dynamically for agent folders, use static count for others if available
  const isAgentFolder = folder.id?.startsWith('agent-')
  const count = (isAgentFolder || folder.count === undefined) 
    ? getUnreadCount(emails, folder.id) 
    : folder.count
  const showPulse = folder.id === 'agent-queue' && count > 0

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between ${isChild ? 'pl-8 py-1.5' : 'px-4 py-2'} text-left rounded-md transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700 font-semibold'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center space-x-2">
        <span className={isChild ? 'text-base' : 'text-lg'}>{folder.icon}</span>
        <span className={isChild ? 'text-sm' : 'text-base'}>{folder.name}</span>
        {showPulse && (
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        )}
      </div>
      {count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

