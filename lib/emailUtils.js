// Helper functions for email operations

export function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

export function formatFullDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function getInitials(name) {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function getSenderName(email) {
  if (!email) return 'Unknown'
  const match = email.match(/^(.+?)\s*<(.+)>|^(.+)$/)
  if (match) {
    return match[1] || match[3] || email.split('@')[0]
  }
  return email.split('@')[0]
}

export function filterEmailsByFolder(emails, folderId) {
  if (folderId === 'all') return emails
  
  // Handle part-based folder structure
  // Format: agent-part-{partName}-{subfolder}
  if (folderId.startsWith('agent-part-')) {
    const parts = folderId.split('-')
    if (parts.length >= 4) {
      // Extract part name (everything between 'agent-part-' and the last part)
      const partNameParts = parts.slice(2, -1) // Skip 'agent', 'part', and last part (subfolder)
      const partName = partNameParts.join(' ').replace(/-/g, ' ')
      const subfolder = parts[parts.length - 1] // Last part is the subfolder type
      
      // Get emails for this part
      const partEmails = emails.filter(email => {
        if (!email.rfqId) return false
        const emailPartName = getPartNameFromRfq(emails, email.rfqId)
        if (!emailPartName) return false
        // Normalize comparison (case-insensitive, handle spaces/hyphens)
        const normalizedEmailPart = emailPartName.toLowerCase().replace(/\s+/g, ' ')
        const normalizedTargetPart = partName.toLowerCase().replace(/\s+/g, ' ')
        return normalizedEmailPart === normalizedTargetPart
      })
      
      // Filter by subfolder type
      switch (subfolder) {
        case 'sent':
          // Show the latest email in each thread (most recent reply, or original if no replies)
          // Group emails by threadId
          const threadMap = {}
          partEmails.forEach(email => {
            if (!email.threadId) {
              // Legacy emails without threadId - treat as separate threads
              if (email.isAgentEmail && email.rfqStatus === 'sent') {
                const legacyThreadId = `legacy-${email.id}`
                if (!threadMap[legacyThreadId] || new Date(email.date) > new Date(threadMap[legacyThreadId].date)) {
                  threadMap[legacyThreadId] = email
                }
              }
            } else {
              // Group by threadId and keep the latest email in each thread
              if (!threadMap[email.threadId] || new Date(email.date) > new Date(threadMap[email.threadId].date)) {
                threadMap[email.threadId] = email
              }
            }
          })
          // Return only the latest email from each thread
          return Object.values(threadMap)
        case 'awaiting':
          // Show emails where we're waiting for supplier response
          return partEmails.filter(email => {
            if (!email.threadId) {
              // Legacy emails without threadId - only show if they're original RFQs with no responses
              if (email.isAgentEmail && email.rfqStatus === 'sent' && !email.needsClarification && !email.isQuote) {
                // Check if there are any responses to this RFQ
                const rfqResponses = emails.filter(e => 
                  e.rfqId === email.rfqId && 
                  (e.needsClarification || e.isQuote) &&
                  (e.from === email.to || e.to === email.to)
                )
                return rfqResponses.length === 0
              }
              return false
            }
            
            const threadId = email.threadId
            const threadEmails = getThreadEmails(emails, threadId)
            const hasSupplierResponse = threadEmails.some(e => e.threadIndex === 1) // Supplier responded
            const hasOurResponse = threadEmails.some(e => e.threadIndex === 2 || e.needsEngineerReview === true) // We responded
            
            // Original RFQ with no supplier responses yet - should be EMPTY after simulate replies
            if (email.threadIndex === 0 || email.threadIndex === undefined) {
              // Only show if no supplier has responded yet
              return !hasSupplierResponse
            }
            
            // After sending clarification response: show the entire thread (original RFQ + supplier clarification + our response)
            // Our response has threadIndex === 2
            if (email.threadIndex === 2 && !email.needsEngineerReview) {
              return true
            }
            
            // After forwarding to engineer: show forward email
            if (email.needsEngineerReview === true) {
              return true
            }
            
            // Also show the original RFQ and clarification request in the thread if we've responded
            if (email.threadIndex <= 1 && hasOurResponse) {
              return true
            }
            
            return false
          })
        case 'clarifications':
          // Show ONLY clarification request emails (needsClarification === true, threadIndex === 1)
          // Only if no response has been sent yet
          return partEmails.filter(email => {
            if (!email.needsClarification || email.threadIndex !== 1) return false
            
            // Check if there's a response (threadIndex === 2 or needsEngineerReview) in the thread
            const threadId = email.threadId
            if (!threadId) return true
            
            const threadEmails = getThreadEmails(emails, threadId)
            const hasResponse = threadEmails.some(e => e.threadIndex === 2 || e.needsEngineerReview === true)
            
            // Only show if no response has been sent yet
            return !hasResponse
          })
        case 'quotes':
          // Show ONLY quote emails (isQuote === true, threadIndex === 1)
          return partEmails.filter(email => email.isQuote === true && email.threadIndex === 1)
        default:
          return partEmails
      }
    }
  }
  
  // Legacy agent folder filters (for backward compatibility)
  if (folderId === 'agent-active') {
    return emails.filter(email => 
      email.isAgentEmail === true && 
      email.rfqStatus && 
      email.rfqStatus === 'sent' &&
      !email.needsClarification &&
      !email.isQuote
    )
  }
  
  if (folderId === 'agent-queue') {
    return emails.filter(email => email.needsClarification === true)
  }

  if (folderId === 'agent-quotes') {
    return emails.filter(email => email.isQuote === true)
  }

  if (folderId === 'agent-clarifications') {
    return emails.filter(email => email.needsClarification === true)
  }
  
  if (folderId === 'agent-complete') {
    return emails.filter(email => email.rfqStatus === 'complete')
  }
  
  // Standard folder filtering
  return emails.filter(email => email.folder === folderId)
}

// Group emails by RFQ ID/part
export function groupEmailsByRFQ(emails) {
  const grouped = {}
  emails.forEach(email => {
    if (email.rfqId) {
      if (!grouped[email.rfqId]) {
        grouped[email.rfqId] = []
      }
      grouped[email.rfqId].push(email)
    }
  })
  return grouped
}

export function filterEmailsBySearch(emails, searchQuery) {
  if (!searchQuery) return emails
  const query = searchQuery.toLowerCase()
  return emails.filter(email =>
    email.subject.toLowerCase().includes(query) ||
    email.from.toLowerCase().includes(query) ||
    email.body.toLowerCase().includes(query)
  )
}

export function getUnreadCount(emails, folderId) {
  if (folderId === 'all') {
    return emails.filter(email => !email.read).length
  }
  
  // Handle part-based folder structure
  if (folderId.startsWith('agent-part-')) {
    const parts = folderId.split('-')
    if (parts.length >= 4) {
      // Extract part name
      const partNameParts = parts.slice(2, -1)
      const partName = partNameParts.join(' ').replace(/-/g, ' ')
      const subfolder = parts[parts.length - 1]
      
      // Get emails for this part
      const partEmails = emails.filter(email => {
        if (!email.rfqId) return false
        const emailPartName = getPartNameFromRfq(emails, email.rfqId)
        if (!emailPartName) return false
        const normalizedEmailPart = emailPartName.toLowerCase().replace(/\s+/g, ' ')
        const normalizedTargetPart = partName.toLowerCase().replace(/\s+/g, ' ')
        return normalizedEmailPart === normalizedTargetPart
      })
      
      // Filter by subfolder type and count unread
      switch (subfolder) {
        case 'sent':
          // Count unread emails from the latest email in each thread
          const threadMapForCount = {}
          partEmails.forEach(email => {
            if (!email.threadId) {
              // Legacy emails without threadId - treat as separate threads
              if (email.isAgentEmail && email.rfqStatus === 'sent') {
                const legacyThreadId = `legacy-${email.id}`
                if (!threadMapForCount[legacyThreadId] || new Date(email.date) > new Date(threadMapForCount[legacyThreadId].date)) {
                  threadMapForCount[legacyThreadId] = email
                }
              }
            } else {
              // Group by threadId and keep the latest email in each thread
              if (!threadMapForCount[email.threadId] || new Date(email.date) > new Date(threadMapForCount[email.threadId].date)) {
                threadMapForCount[email.threadId] = email
              }
            }
          })
          // Count unread emails from latest in each thread
          return Object.values(threadMapForCount).filter(email => !email.read).length
        case 'awaiting':
          return partEmails.filter(email => 
            email.isAgentEmail === true && 
            email.rfqStatus === 'sent' &&
            !email.needsClarification &&
            !email.isQuote &&
            !email.read
          ).length
        case 'clarifications':
          return partEmails.filter(email => email.needsClarification === true && !email.read).length
        case 'quotes':
          return partEmails.filter(email => email.isQuote === true && !email.read).length
        default:
          return partEmails.filter(email => !email.read).length
      }
    }
  }
  
  // Legacy agent folder filters (for backward compatibility)
  if (folderId === 'agent-active') {
    return emails.filter(email => 
      email.isAgentEmail === true && 
      email.rfqStatus && 
      email.rfqStatus !== 'complete' &&
      !email.read
    ).length
  }
  
  if (folderId === 'agent-queue') {
    return emails.filter(email => 
      email.needsClarification === true && 
      !email.read
    ).length
  }
  
  if (folderId === 'agent-quotes') {
    return emails.filter(email => 
      email.isQuote === true && 
      !email.read
    ).length
  }
  
  if (folderId === 'agent-clarifications') {
    return emails.filter(email => 
      email.needsClarification === true && 
      !email.read
    ).length
  }
  
  if (folderId === 'agent-complete') {
    return emails.filter(email => 
      email.rfqStatus === 'complete' && 
      !email.read
    ).length
  }
  
  return emails.filter(email => email.folder === folderId && !email.read).length
}

// Extract part name from email
export function extractPartNameFromEmail(email) {
  if (!email) return null
  
  // Try to get from subject
  const subjectMatch = email.subject?.match(/RFQ Request - (.+?) -/) || 
                       email.subject?.match(/RFQ-[\d-]+: (.+?) \(/)
  if (subjectMatch && subjectMatch[1]) {
    return subjectMatch[1].trim()
  }
  
  // Try to get from body
  const bodyMatch = email.body?.match(/\*\*Part Name:\*\* (.+?)(?:\n|$)/i) ||
                   email.body?.match(/Part Name: (.+?)(?:\n|$)/i) ||
                   email.body?.match(/Part:\s*(.+?)(?:\n|$)/i)
  if (bodyMatch && bodyMatch[1]) {
    return bodyMatch[1].trim()
  }
  
  return null
}

// Get part name from RFQ ID
export function getPartNameFromRfq(emails, rfqId) {
  if (!rfqId || !emails) return null
  
  // First try to find an email with partName stored
  const emailWithPartName = emails.find(e => e.rfqId === rfqId && e.partName)
  if (emailWithPartName && emailWithPartName.partName) {
    return emailWithPartName.partName
  }
  
  // Find the original request email for this RFQ
  const requestEmail = emails.find(e => 
    e.rfqId === rfqId && 
    (e.from?.includes('sarah.chen') || e.from?.includes('engineering')) &&
    !e.isAgentEmail
  )
  
  if (requestEmail) {
    return extractPartNameFromEmail(requestEmail)
  }
  
  // Fallback: find any email with this RFQ ID
  const anyEmail = emails.find(e => e.rfqId === rfqId)
  if (anyEmail) {
    return extractPartNameFromEmail(anyEmail)
  }
  
  return null
}

// Generate dynamic part folders from emails
export function getPartFolders(emails) {
  if (!emails || emails.length === 0) return []
  
  // Get all unique RFQ IDs
  const rfqIds = [...new Set(emails.filter(e => e.rfqId).map(e => e.rfqId))]
  
  // Group by part name
  const partMap = {}
  
  rfqIds.forEach(rfqId => {
    const partName = getPartNameFromRfq(emails, rfqId)
    if (partName) {
      // Normalize part name for folder ID (replace spaces with hyphens, remove special chars, lowercase)
      const normalizedPartName = partName
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      const folderId = `agent-part-${normalizedPartName}`
      
      if (!partMap[folderId]) {
        partMap[folderId] = {
          id: folderId,
          name: partName,
          icon: '📦',
          isExpandable: true,
          children: [
            {
              id: `${folderId}-sent`,
              name: 'Sent RFQs',
              icon: '📤'
            },
            {
              id: `${folderId}-awaiting`,
              name: 'Awaiting Responses',
              icon: '⏳'
            },
            {
              id: `${folderId}-clarifications`,
              name: 'Clarifications',
              icon: '❓'
            },
            {
              id: `${folderId}-quotes`,
              name: 'Quotes',
              icon: '💰'
            }
          ]
        }
      }
    }
  })
  
  return Object.values(partMap)
}

// Email threading helper functions

/**
 * Generate a thread ID from RFQ ID and supplier email
 * @param {string} rfqId - The RFQ ID
 * @param {string} supplierEmail - The supplier's email address
 * @returns {string} Thread ID
 */
export function getThreadId(rfqId, supplierEmail) {
  if (!rfqId || !supplierEmail) return null
  const normalizedEmail = supplierEmail.replace(/[@.]/g, '-').toLowerCase()
  return `thread-${rfqId}-${normalizedEmail}`
}

/**
 * Get all emails in a thread
 * @param {Array} emails - All emails
 * @param {string} threadId - The thread ID
 * @returns {Array} All emails in the thread, sorted by threadIndex
 */
export function getThreadEmails(emails, threadId) {
  if (!threadId || !emails) return []
  return emails
    .filter(email => email.threadId === threadId)
    .sort((a, b) => (a.threadIndex || 0) - (b.threadIndex || 0))
}

/**
 * Get the root (original) email in a thread
 * @param {Object} email - An email in the thread
 * @param {Array} emails - All emails
 * @returns {Object|null} The root email (threadIndex === 0) or null
 */
export function getThreadRoot(email, emails) {
  if (!email || !emails) return null
  const threadId = email.threadId
  if (!threadId) return null
  
  const threadEmails = getThreadEmails(emails, threadId)
  return threadEmails.find(e => e.threadIndex === 0) || null
}

/**
 * Get the thread ID from an email (generate if not present)
 * @param {Object} email - The email
 * @param {Array} emails - All emails (for looking up parent)
 * @returns {string|null} Thread ID
 */
export function getEmailThreadId(email, emails = []) {
  if (!email) return null
  
  // If email already has threadId, return it
  if (email.threadId) return email.threadId
  
  // If email has inReplyTo, get threadId from parent
  if (email.inReplyTo) {
    const parentEmail = emails.find(e => e.id === email.inReplyTo)
    if (parentEmail && parentEmail.threadId) {
      return parentEmail.threadId
    }
  }
  
  // Generate threadId from RFQ ID and supplier email
  if (email.rfqId) {
    // For sent RFQs, use the 'to' field (supplier email)
    // For received emails, use the 'from' field (supplier email)
    const supplierEmail = email.isAgentEmail && email.rfqStatus === 'sent' 
      ? email.to 
      : email.from
    
    if (supplierEmail) {
      return getThreadId(email.rfqId, supplierEmail)
    }
  }
  
  return null
}

