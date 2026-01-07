import { formatDate, getInitials, getSenderName, cleanSubject } from '../lib/emailUtils'

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

// Outlook blue accent for unread indicator
const accentBlue = '#4aa3ff'

export default function EmailItem({ email, isSelected, onClick }) {
  const senderName = getSenderName(email.from)
  const initials = getInitials(senderName)
  const avatarColor = getAvatarColor(senderName)
  const hasAttachments = email.attachments && email.attachments.length > 0
  const attachmentCount = hasAttachments ? email.attachments.length : 0
  const needsClarification = email.needsClarification === true
  const statusBadge = getStatusBadge(email)
  const isUnread = !email.read

  return (
    <div
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={`cursor-pointer transition-colors duration-150 ${
        isSelected
          ? 'bg-outlook-selected'
          : 'hover:bg-outlook-hover'
      }`}
      style={{
        display: 'grid',
        gridTemplateColumns: '16px 36px 1fr',
        alignItems: 'center',
        columnGap: '10px',
        padding: '10px 12px',
      }}
      role="button"
      tabIndex={0}
      aria-label={`Email from ${senderName}: ${email.subject}`}
    >
      {/* Unread dot indicator */}
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '999px',
          backgroundColor: accentBlue,
          justifySelf: 'center',
          opacity: isUnread ? 1 : 0,
        }}
      />

      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
        {initials}
      </div>

      {/* Content */}
      <div className="min-w-0">
        {/* Top line: sender display name + status badge + time */}
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center space-x-2 min-w-0">
            <span 
              className="truncate"
              style={{
                fontSize: '15px',
                lineHeight: '1.3',
                color: isUnread ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)',
                fontWeight: isUnread ? 700 : 500,
              }}
            >
              {senderName}
            </span>
            {statusBadge}
          </div>
          <span 
            className="text-[11px] whitespace-nowrap ml-2"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            {formatDate(email.date)}
          </span>
        </div>

        {/* Subject line */}
        <p 
          className="text-[13px] truncate leading-tight"
          style={{
            color: isUnread ? accentBlue : 'rgba(255,255,255,0.65)',
            fontWeight: isUnread ? 600 : 400,
          }}
        >
          {cleanSubject(email.subject)}
        </p>

        {/* Preview snippet */}
        <p 
          className="text-[12px] truncate mt-0.5 leading-tight"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {email.body.substring(0, 80)}...
        </p>
      </div>
    </div>
  )
}

