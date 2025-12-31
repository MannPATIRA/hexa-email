// Time progression system for demo events

export const EVENT_TYPES = {
  RFQ_SENT: 'rfq_sent',
  CLARIFICATION_RECEIVED: 'clarification_received',
  QUOTE_RECEIVED: 'quote_received',
  PO_SENT: 'po_sent'
}

// Create event timeline from emails
export function createEventTimeline(emails) {
  const events = []
  
  emails.forEach(email => {
    if (email.isAgentEmail && email.rfqId) {
      if (email.rfqStatus === 'sent') {
        events.push({
          type: EVENT_TYPES.RFQ_SENT,
          timestamp: new Date(email.date),
          rfqId: email.rfqId,
          emailId: email.id,
          supplier: email.to?.split('@')[0] || 'unknown'
        })
      } else if (email.needsClarification) {
        events.push({
          type: EVENT_TYPES.CLARIFICATION_RECEIVED,
          timestamp: new Date(email.date),
          rfqId: email.rfqId,
          emailId: email.id,
          supplier: email.from?.split('@')[0] || 'unknown'
        })
      } else if (email.isQuote) {
        events.push({
          type: EVENT_TYPES.QUOTE_RECEIVED,
          timestamp: new Date(email.date),
          rfqId: email.rfqId,
          emailId: email.id,
          supplier: email.from?.split('@')[0] || 'unknown'
        })
      }
    }
  })
  
  // Sort by timestamp
  events.sort((a, b) => a.timestamp - b.timestamp)
  
  return events
}

// Get next event after current time
export function getNextEvent(events, currentTime = new Date()) {
  return events.find(event => event.timestamp > currentTime)
}

// Get event description
export function getEventDescription(event) {
  if (!event) return 'No more events'
  
  switch (event.type) {
    case EVENT_TYPES.RFQ_SENT:
      return `RFQ sent to ${event.supplier}`
    case EVENT_TYPES.CLARIFICATION_RECEIVED:
      return `Clarification received from ${event.supplier}`
    case EVENT_TYPES.QUOTE_RECEIVED:
      return `Quote received from ${event.supplier}`
    case EVENT_TYPES.PO_SENT:
      return `PO sent to ${event.supplier}`
    default:
      return 'Unknown event'
  }
}

// Format time for display
export function formatEventTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

