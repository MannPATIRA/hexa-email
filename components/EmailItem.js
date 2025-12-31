import { formatDate, getInitials, getSenderName } from '../lib/emailUtils'

function getStatusBadge(email) {
  if (!email.isAgentEmail) return null

  if (email.needsEngineerReview) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 animate-pulse badge-hover">
        Engineer Review
      </span>
    )
  }

  if (email.needsClarification) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 animate-pulse badge-hover">
        Needs Input
      </span>
    )
  }

  // Check if clarification was sent (has clarificationAnswers but no longer needsClarification)
  if (email.clarificationAnswers && !email.needsClarification && email.rfqStatus === 'sent') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
        Clarification Sent
      </span>
    )
  }

  if (email.isQuote) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        Quote
      </span>
    )
  }

  if (email.rfqStatus === 'sent') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
        RFQ Sent
      </span>
    )
  }

  return null
}

export default function EmailItem({ email, isSelected, onClick }) {
  const senderName = getSenderName(email.from)
  const initials = getInitials(senderName)
  const hasAttachments = email.attachments && email.attachments.length > 0
  const attachmentCount = hasAttachments ? email.attachments.length : 0
  const needsClarification = email.needsClarification === true
  const statusBadge = getStatusBadge(email)

  // Determine border color based on clarification status
  const borderClass = needsClarification
    ? 'border-l-4 border-l-yellow-400'
    : isSelected
    ? 'border-l-4 border-l-blue-600'
    : ''

  return (
    <div
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={`p-4 border-b border-gray-200 cursor-pointer transition-all duration-200 ${borderClass} ${
        isSelected
          ? 'bg-blue-50 border-l-4'
          : 'hover:bg-gray-100'
      } ${!email.read ? 'bg-white font-semibold' : 'bg-gray-50'} active:scale-[0.98]`}
      role="button"
      tabIndex={0}
      aria-label={`Email from ${senderName}: ${email.subject}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <span className={`text-sm ${!email.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                {senderName}
              </span>
              {/* Show "To: [supplier name]" for sent RFQ emails */}
              {email.isAgentEmail && email.rfqStatus === 'sent' && email.to && !email.isQuote && !email.needsClarification && (
                <span className="text-xs text-gray-600 font-medium">
                  → {email.supplierName || email.to.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              )}
              {email.rfqId && (
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {email.rfqId}
                </span>
              )}
              {statusBadge}
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {hasAttachments && (
                <div className="flex items-center space-x-1 text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 000-2.828l-6.414-6.414a2 2 0 10-2.828 2.828L15.172 7z" />
                  </svg>
                  <span className="text-xs">{attachmentCount}</span>
                </div>
              )}
              <span className="text-xs text-gray-500">{formatDate(email.date)}</span>
            </div>
          </div>
          <p className={`text-sm truncate ${!email.read ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
            {email.subject}
          </p>
          {email.isQuote && email.quoteData && email.quoteData.unitPrice && (
            <p className="text-xs text-green-600 font-medium mt-0.5">
              ${email.quoteData.unitPrice.toFixed(2)}/unit
            </p>
          )}
          <p className="text-xs text-gray-500 truncate mt-1">
            {email.body.substring(0, 60)}...
          </p>
        </div>
      </div>
    </div>
  )
}

