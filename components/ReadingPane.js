import { formatFullDate, getInitials, getSenderName } from '../lib/emailUtils'
import Button from './Button'

export default function ReadingPane({ email, onDelete, onArchive, onMarkRead }) {
  if (!email) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
        <div className="text-center">
          <p className="text-lg">Select an email to read</p>
        </div>
      </div>
    )
  }

  const senderName = getSenderName(email.from)
  const initials = getInitials(senderName)

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">{email.subject}</h1>
          <div className="flex space-x-2">
            {onMarkRead && (
              <Button
                variant="ghost"
                onClick={() => onMarkRead(email.id)}
                className="text-sm"
              >
                {email.read ? 'Mark Unread' : 'Mark Read'}
              </Button>
            )}
            {onArchive && (
              <Button
                variant="ghost"
                onClick={() => onArchive(email.id)}
                className="text-sm"
              >
                Archive
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                onClick={() => onDelete(email.id)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-gray-900">{senderName}</p>
              <p className="text-sm text-gray-500">&lt;{email.from}&gt;</p>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              To: {email.to} • {formatFullDate(email.date)}
            </p>
          </div>
        </div>
        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-md"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 000-2.828l-6.414-6.414a2 2 0 10-2.828 2.828L15.172 7z" />
                  </svg>
                  <span className="text-sm text-gray-700">{attachment}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{email.body}</p>
        </div>
      </div>
    </div>
  )
}

