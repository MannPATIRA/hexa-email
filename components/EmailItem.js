import { formatDate, getInitials, getSenderName } from '../lib/emailUtils'

export default function EmailItem({ email, isSelected, onClick }) {
  const senderName = getSenderName(email.from)
  const initials = getInitials(senderName)

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 border-l-4 border-l-blue-600'
          : 'hover:bg-gray-50'
      } ${!email.read ? 'bg-white font-semibold' : 'bg-gray-50'}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${!email.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                {senderName}
              </span>
              {email.attachments && email.attachments.length > 0 && (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 000-2.828l-6.414-6.414a2 2 0 10-2.828 2.828L15.172 7z" />
                </svg>
              )}
            </div>
            <span className="text-xs text-gray-500">{formatDate(email.date)}</span>
          </div>
          <p className={`text-sm truncate ${!email.read ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
            {email.subject}
          </p>
          <p className="text-xs text-gray-500 truncate mt-1">
            {email.body.substring(0, 60)}...
          </p>
        </div>
      </div>
    </div>
  )
}

