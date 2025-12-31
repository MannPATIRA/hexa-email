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
  return emails.filter(email => email.folder === folderId)
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
  return emails.filter(email => email.folder === folderId && !email.read).length
}

