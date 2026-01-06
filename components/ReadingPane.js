import { useState, useEffect } from 'react'
import { formatFullDate, getInitials, getSenderName, getThreadEmails, getEmailThreadId } from '../lib/emailUtils'
import Button from './Button'
import AgentContextPanel from './AgentContextPanel'
import ClarificationInterface from './ClarificationInterface'
import { Sun, ClipboardList, Sparkles, Smile, Reply, ReplyAll, Forward } from 'lucide-react'

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
                <Sun size={18} strokeWidth={1.5} className="block" />
              </button>
              
              {/* Summarise button with label */}
              <button className="flex items-center space-x-1.5 px-2 py-1 hover:bg-outlook-hover rounded transition-colors leading-none">
                <div className="relative inline-block">
                  <ClipboardList size={18} strokeWidth={1.5} className="block" />
                  <Sparkles size={8} strokeWidth={1.5} className="absolute -top-0.5 -right-0.5 block" />
                </div>
                <span className="text-sm font-semibold text-white">Summarise</span>
              </button>
              
              {/* Emoji reaction */}
              <button className="p-1.5 hover:bg-outlook-hover rounded transition-colors leading-none">
                <Smile size={18} strokeWidth={1.5} className="block" />
              </button>
              
              {/* Reply */}
              <button className="p-1.5 hover:bg-outlook-hover rounded transition-colors leading-none">
                <Reply size={18} strokeWidth={1.5} className="block" />
              </button>
              
              {/* Reply All */}
              <button className="p-1.5 hover:bg-outlook-hover rounded transition-colors leading-none">
                <ReplyAll size={18} strokeWidth={1.5} className="block" />
              </button>
              
              {/* Forward */}
              <button className="p-1.5 hover:bg-outlook-hover rounded transition-colors leading-none">
                <Forward size={18} strokeWidth={1.5} className="block" />
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
