import { useState, useEffect } from 'react'
import { formatFullDate, getInitials, getSenderName, getThreadEmails, getEmailThreadId } from '../lib/emailUtils'
import Button from './Button'
import AgentContextPanel from './AgentContextPanel'
import ClarificationInterface from './ClarificationInterface'

export default function ReadingPane({ email, onDelete, onArchive, onMarkRead, emails = [], onCompareQuotes, onSendToAgent, onClarificationSubmit, onEmailSelect }) {
  const [viewingThreadEmail, setViewingThreadEmail] = useState(null)
  
  // Reset thread email view when main email changes
  useEffect(() => {
    setViewingThreadEmail(null)
  }, [email?.id])
  
  if (!email) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
        <div className="text-center">
          <p className="text-lg">Select an email to read</p>
        </div>
      </div>
    )
  }

  // Get thread emails if this email is part of a thread
  const threadId = getEmailThreadId(email, emails)
  const threadEmails = threadId ? getThreadEmails(emails, threadId) : [email]
  const hasThread = threadEmails.length > 1
  
  // Use the selected email from thread view, or the main email
  const displayEmail = viewingThreadEmail || email
  
  const senderName = getSenderName(displayEmail.from)
  const initials = getInitials(senderName)
  const isAgentEmail = displayEmail.isAgentEmail === true
  
  // Check if this is an engineering email that can be sent to agent
  // Don't show button if email is already an agent email or has an rfqId
  const isEngineeringEmail = email.from?.includes('sarah.chen') || 
                             email.from?.includes('engineering') ||
                             (email.subject?.toLowerCase().includes('rfq request') && !email.isAgentEmail)
  
  // Hide button if email is already processed (has rfqId or isAgentEmail is true)
  const canSendToAgent = isEngineeringEmail && !email.isAgentEmail && !email.rfqId && onSendToAgent

  return (
    <div className="h-full flex overflow-hidden bg-white">
      <div className={`h-full overflow-y-auto scrollbar-custom ${isAgentEmail ? 'flex-1' : 'w-full'}`}>
      {/* Thread View - Show all emails in thread */}
      {hasThread && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Thread ({threadEmails.length} messages)</h3>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {threadEmails.map((threadEmail, index) => {
              const isSelected = threadEmail.id === displayEmail.id
              const threadSenderName = getSenderName(threadEmail.from)
              return (
                <button
                  key={threadEmail.id}
                  onClick={() => {
                    setViewingThreadEmail(threadEmail)
                    if (onEmailSelect) {
                      onEmailSelect(threadEmail)
                    }
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                      {getInitials(threadSenderName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {threadSenderName}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatFullDate(threadEmail.date)}
                        </span>
                        {threadEmail.isQuote && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Quote</span>
                        )}
                        {threadEmail.needsClarification && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Clarification</span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 truncate ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>
                        {threadEmail.subject}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
      
      <div className="p-6 border-b border-gray-200">
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl font-semibold text-gray-900 flex-1 min-w-0 pr-4">{displayEmail.subject}</h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              {canSendToAgent && (
                <Button
                  variant="primary"
                  onClick={() => {
                    if (onSendToAgent) {
                      onSendToAgent(email)
                    }
                  }}
                  className="px-6 py-2.5 font-semibold text-base shadow-sm hover:shadow-md transition-shadow"
                >
                  Hexa
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {onMarkRead && (
              <Button
                variant="ghost"
                onClick={() => onMarkRead(displayEmail.id)}
                className="text-sm px-3 py-1.5"
              >
                {displayEmail.read ? 'Mark Unread' : 'Mark Read'}
              </Button>
            )}
            {onArchive && (
              <Button
                variant="ghost"
                onClick={() => onArchive(displayEmail.id)}
                className="text-sm px-3 py-1.5"
              >
                Archive
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                onClick={() => onDelete(displayEmail.id)}
                className="text-sm px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
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
                  {/* Show supplier name for sent RFQ emails */}
                  {displayEmail.isAgentEmail && displayEmail.rfqStatus === 'sent' && displayEmail.supplierName && !displayEmail.isQuote && !displayEmail.needsClarification && (
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      To: {displayEmail.supplierName}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {displayEmail.isAgentEmail && displayEmail.rfqStatus === 'sent' && displayEmail.supplierEmail ? (
                    <>To: {displayEmail.supplierEmail} • {formatFullDate(displayEmail.date)}</>
                  ) : (
                    <>To: {displayEmail.to} • {formatFullDate(displayEmail.date)}</>
                  )}
                </p>
              </div>
        </div>
        {displayEmail.attachments && displayEmail.attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
            <div className="flex flex-wrap gap-2">
              {displayEmail.attachments.map((attachment, index) => {
                const attachmentName = typeof attachment === 'string' ? attachment : attachment.name
                const attachmentType = typeof attachment === 'object' ? attachment.type : null
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-md"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 000-2.828l-6.414-6.414a2 2 0 10-2.828 2.828L15.172 7z" />
                    </svg>
                    <span className="text-sm text-gray-700">{attachmentName}</span>
                    {attachmentType && (
                      <span className="text-xs text-gray-500">({attachmentType})</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{displayEmail.body}</p>
        </div>
        <ClarificationInterface
          email={displayEmail}
          onSubmit={(answers) => {
            if (onClarificationSubmit) {
              onClarificationSubmit(answers)
            }
          }}
          onForward={(answers) => {
            console.log('Forward to Sarah Chen:', answers)
            // TODO: Forward to Sarah Chen
          }}
        />
      </div>
      </div>
      {isAgentEmail && (
        <AgentContextPanel email={displayEmail} emails={emails} onCompareQuotes={onCompareQuotes} />
      )}
    </div>
  )
}

