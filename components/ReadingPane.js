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
      <div className="flex items-center justify-center h-full text-outlook-text-secondary" style={{ padding: '20px 28px' }}>
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
    <div className="h-full flex overflow-hidden">
      <div className={`h-full overflow-y-auto scrollbar-custom ${isAgentEmail ? 'flex-1' : 'w-full'}`}>
      
      <div style={{ padding: '20px 28px 28px 28px' }}>
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-semibold text-white flex-1 min-w-0">{displayEmail.subject}</h1>
            <div className="flex items-center space-x-1 text-outlook-text-secondary">
              {/* Brightness toggle */}
              <button className="p-1.5 hover:bg-outlook-hover rounded transition-colors leading-none">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </button>
              
              {/* Summarise button with label */}
              <button className="flex items-center space-x-1.5 px-2 py-1 hover:bg-outlook-hover rounded transition-colors leading-none">
                <div className="relative inline-block">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01" /></svg>
                  <svg className="w-2 h-2 absolute -top-0.5 -right-0.5 text-outlook-blue" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </div>
                <span className="text-sm font-normal text-outlook-text-secondary">Summarise</span>
              </button>
              
              {/* Emoji reaction */}
              <button className="p-1.5 hover:bg-outlook-hover rounded transition-colors leading-none">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
              
              {/* Reply */}
              <button className="p-1.5 hover:bg-outlook-hover rounded transition-colors leading-none">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              </button>
              
              {/* Reply All */}
              <button className="p-1.5 hover:bg-outlook-hover rounded transition-colors leading-none">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
              </button>
              
              {/* Forward */}
              <button className="p-1.5 hover:bg-outlook-hover rounded transition-colors leading-none">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
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
