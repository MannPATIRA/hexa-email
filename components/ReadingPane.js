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
      <div className="flex items-center justify-center h-full text-outlook-text-secondary bg-outlook-sidebar">
        <div className="text-center">
          <p className="text-sm">Select an email to read</p>
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
    <div className="h-full flex overflow-hidden bg-outlook-sidebar">
      <div className={`h-full overflow-y-auto scrollbar-custom ${isAgentEmail ? 'flex-1' : 'w-full'}`}>
      
      <div className="p-5">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-semibold text-white flex-1 min-w-0">{displayEmail.subject}</h1>
            <div className="flex items-center space-x-2 text-outlook-text-secondary">
              <button className="p-1.5 hover:bg-outlook-hover rounded transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </button>
              <button className="p-1.5 hover:bg-outlook-hover rounded transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" /></svg>
              </button>
              <button className="p-1.5 hover:bg-outlook-hover rounded transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19H6.931A1.922 1.922 0 015 17.087V8h12.069C18.135 8 19 8.857 19 9.913V11" /></svg>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-outlook-blue flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 truncate pr-4">
                  <span className="font-semibold text-sm text-white truncate">{senderName}</span>
                  <span className="text-xs text-outlook-text-secondary truncate">&lt;{displayEmail.from}&gt;</span>
                </div>
                <span className="text-xs text-outlook-text-secondary flex-shrink-0">{formatFullDate(displayEmail.date)}</span>
              </div>
              <div className="text-xs text-outlook-text-secondary mt-0.5">
                To: {displayEmail.to}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2">
          <div className="prose prose-invert max-w-none">
            <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{displayEmail.body}</p>
          </div>
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
