import { formatDate, getInitials, getSenderName } from '../lib/emailUtils'

function getStatusBadge(email) {
  if (!email.isAgentEmail) return null

  if (email.needsEngineerReview) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-[#fed7aa]/20 text-[#fb923c] border border-[#fb923c]/30 whitespace-nowrap flex-shrink-0">
        Engineer Review
      </span>
    )
  }

  if (email.needsClarification) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-[#fde68a]/20 text-[#facc15] border border-[#facc15]/30 whitespace-nowrap flex-shrink-0">
        Query
      </span>
    )
  }

  if (email.clarificationAnswers && !email.needsClarification && email.rfqStatus === 'sent') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-[#e9d5ff]/20 text-[#c084fc] border border-[#c084fc]/30 whitespace-nowrap flex-shrink-0">
        Clarification Sent
      </span>
    )
  }

  if (email.isQuote) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-[#bbf7d0]/20 text-[#4ade80] border border-[#4ade80]/30 whitespace-nowrap flex-shrink-0">
        Quote
      </span>
    )
  }

  if (email.rfqStatus === 'sent') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-[#bfdbfe]/20 text-[#60a5fa] border border-[#60a5fa]/30 whitespace-nowrap flex-shrink-0">
        RFQ Sent
      </span>
    )
  }

  return null
}

function getAvatarColor(name) {
  const colors = [
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-green-500 to-green-700',
    'from-orange-500 to-orange-700',
    'from-pink-500 to-pink-700',
    'from-teal-500 to-teal-700'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default function EmailItem({ email, isSelected, onClick }) {
  const senderName = getSenderName(email.from)
  const initials = getInitials(senderName)
  const avatarColor = getAvatarColor(senderName)
  const hasAttachments = email.attachments && email.attachments.length > 0
  const attachmentCount = hasAttachments ? email.attachments.length : 0
  const needsClarification = email.needsClarification === true
  const statusBadge = getStatusBadge(email)

  // Determine border color based on clarification status
  const borderClass = needsClarification
    ? 'border-l-4 border-l-yellow-400'
    : isSelected
    ? 'border-l-4 border-l-outlook-blue'
    : ''

  return (
    <div
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={`px-4 py-2 cursor-pointer transition-colors duration-150 ${
        isSelected
          ? 'bg-outlook-selected'
          : 'hover:bg-outlook-hover'
      } relative`}
      role="button"
      tabIndex={0}
      aria-label={`Email from ${senderName}: ${email.subject}`}
    >
      {!email.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-outlook-blue"></div>
      )}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-semibold`}>
            {initials}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center space-x-2 min-w-0">
              <span className={`text-sm truncate ${!email.read ? 'font-semibold text-white' : 'font-normal text-outlook-text-secondary'}`}>
                {senderName}
              </span>
              {statusBadge}
            </div>
            <span className="text-[11px] text-outlook-text-secondary whitespace-nowrap ml-2">{formatDate(email.date)}</span>
          </div>
          <p className={`text-sm truncate leading-tight ${!email.read ? 'text-white font-medium' : 'text-outlook-text-secondary'}`}>
            {email.subject}
          </p>
          <p className="text-xs text-outlook-text-tertiary truncate mt-0.5 leading-tight">
            {email.body.substring(0, 60)}...
          </p>
        </div>
      </div>
    </div>
  )
}

