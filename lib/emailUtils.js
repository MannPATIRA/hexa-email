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

/**
 * Derive a friendly display name from an email address
 * Examples:
 * - quotes@alliedparts.com -> "Allied Parts"
 * - john.doe@company.com -> "John Doe"  
 * - sarah_chen@bigcorp.com -> "Sarah Chen"
 */
function deriveNameFromEmail(emailAddress) {
  if (!emailAddress) return 'Unknown'
  
  // Extract just the email if it's in "Name <email>" format
  const emailMatch = emailAddress.match(/<(.+)>/)
  const cleanEmail = emailMatch ? emailMatch[1] : emailAddress
  
  const [localPart, domain] = cleanEmail.split('@')
  
  // Common generic local parts that should use domain name instead
  const genericLocalParts = ['info', 'sales', 'quotes', 'support', 'contact', 'hello', 'team', 'admin', 'noreply', 'no-reply', 'notifications', 'alerts']
  
  if (genericLocalParts.includes(localPart.toLowerCase())) {
    // Use domain as company name
    if (domain) {
      // Remove common suffixes and format
      const domainName = domain
        .split('.')[0] // Get first part before TLD
        .replace(/[-_]/g, ' ') // Replace separators with spaces
      // Title case
      return domainName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }
  }
  
  // Use local part as name - replace dots, underscores, hyphens with spaces and title case
  const name = localPart
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  
  return name
}

/**
 * Get sender display name from email
 * Priority: Display name from "Name <email>" format > derived name from email
 */
export function getSenderName(email) {
  if (!email) return 'Unknown'
  
  // Check for "Display Name <email@domain.com>" format
  const match = email.match(/^(.+?)\s*<(.+)>/)
  if (match && match[1]) {
    // Has explicit display name
    const displayName = match[1].trim()
    // Make sure it's not just the email repeated
    if (!displayName.includes('@')) {
      return displayName
    }
  }
  
  // No display name found, derive from email address
  return deriveNameFromEmail(email)
}

/**
 * Get the raw email address from a "Name <email>" format string
 */
export function getEmailAddress(emailString) {
  if (!emailString) return ''
  const match = emailString.match(/<(.+)>/)
  if (match) return match[1]
  // If no angle brackets, it's probably just the email
  if (emailString.includes('@')) return emailString
  return ''
}

export function filterEmailsByFolder(emails, folderId) {
  if (folderId === 'all') return emails
  
  // Handle part-based folder structure
  // Format: agent-part-{partNameId}-{subfolder}
  if (folderId.startsWith('agent-part-')) {
    // Get all parts to match against
    const partFolders = getPartFolders(emails)
    
    // Find which part folder matches this ID
    // We check if folderId starts with the base part folder ID
    const matchingPartFolder = partFolders.find(pf => folderId.startsWith(pf.id))
    
    if (matchingPartFolder) {
      const baseId = matchingPartFolder.id
      const partName = matchingPartFolder.name
      const subfolder = folderId === baseId ? null : folderId.replace(`${baseId}-`, '')
      
      // Get emails for this part
      const partEmails = emails.filter(email => {
        if (!email.rfqId) return false
        const emailPartName = email.partName || getPartNameFromRfq(emails, email.rfqId)
        if (!emailPartName) return false
        
        return normalizePartNameForId(emailPartName) === normalizePartNameForId(partName)
      })
      
      // If we're at the base part folder (not a subfolder), return all emails for that part
      if (!subfolder) {
        return partEmails
      }
      
      // Filter by subfolder type
      switch (subfolder) {
        case 'sent':
          // Show original RFQs sent by the agent
          return partEmails.filter(email => 
            email.isAgentEmail && 
            email.rfqStatus === 'sent' && 
            (email.threadIndex === 0 || email.threadIndex === undefined) &&
            !email.needsClarification && 
            !email.isQuote
          )
        case 'awaiting':
          // Show our responses and engineer reviews
          return partEmails.filter(email => 
            email.isAgentEmail && 
            (email.threadIndex === 2 || email.needsEngineerReview === true)
          )
        case 'clarifications':
          // Show received clarifications
          return partEmails.filter(email => email.needsClarification === true && email.threadIndex === 1)
        case 'quotes':
          // Show received quotes
          return partEmails.filter(email => email.isQuote === true && email.threadIndex === 1)
        default:
          return partEmails
      }
    }
  }
  
  // Legacy agent folder filters (for backward compatibility)
  if (folderId === 'agent') {
    // Return all agent-related emails if the main agent folder is selected
    return emails.filter(email => email.isAgentEmail || email.rfqId)
  }
  
  if (folderId === 'agent-active') {
    return emails.filter(email => 
      email.isAgentEmail === true && 
      email.rfqStatus && 
      email.rfqStatus === 'sent' &&
      !email.needsClarification &&
      !email.isQuote
    )
  }
  
  if (folderId === 'agent-queue' || folderId === 'agent-clarifications') {
    return emails.filter(email => email.needsClarification === true)
  }

  if (folderId === 'agent-quotes') {
    return emails.filter(email => email.isQuote === true)
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
  
  // Use the same filtering logic as filterEmailsByFolder to ensure consistency
  const folderEmails = filterEmailsByFolder(emails, folderId)
  return folderEmails.filter(email => !email.read).length
}

// Extract part name from email
export function extractPartNameFromEmail(email) {
  if (!email) return null
  
  // First check if it's explicitly stored on the email object
  if (email.partName) return email.partName
  
  // Try to get from subject
  const subjectMatch = email.subject?.match(/RFQ Request - (.+?) -/) || 
                       email.subject?.match(/RFQ-[\d-]+: (.+?) \(/) ||
                       email.subject?.match(/RE: RFQ-[\d-]+ - (.+?) -/) ||
                       email.subject?.match(/Quote - RFQ-[\d-]+ \[(.+?)\]/)
  if (subjectMatch && subjectMatch[1]) {
    return subjectMatch[1].trim()
  }
  
  // Try to get from body
  const bodyMatch = email.body?.match(/\*\*Part Name:\*\* (.+?)(?:\n|$)/i) ||
                   email.body?.match(/Part Name: (.+?)(?:\n|$)/i) ||
                   email.body?.match(/Part:\s*(.+?)(?:\n|$)/i)
  if (bodyMatch && bodyMatch[1]) {
    const name = bodyMatch[1].trim()
    // Avoid returning generic text like "Hydraulic Manifold Block" if it's part of a sentence
    return name.split('.')[0].split(',')[0].trim()
  }
  
  return null
}

/**
 * Normalize a part name for use in a folder ID
 */
export function normalizePartNameForId(partName) {
  if (!partName) return ''
  return partName
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
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
      // Normalize part name for folder ID
      const normalizedPartName = normalizePartNameForId(partName)
      const folderId = `agent-part-${normalizedPartName}`
      
      if (!partMap[folderId]) {
        partMap[folderId] = {
          id: folderId,
          name: partName,
          icon: '',
          isExpandable: true,
          children: [
            {
              id: `${folderId}-sent`,
              name: 'Sent RFQs',
              icon: ''
            },
            {
              id: `${folderId}-awaiting`,
              name: 'Awaiting Responses',
              icon: ''
            },
            {
              id: `${folderId}-clarifications`,
              name: 'Clarifications',
              icon: ''
            },
            {
              id: `${folderId}-quotes`,
              name: 'Quotes',
              icon: ''
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

