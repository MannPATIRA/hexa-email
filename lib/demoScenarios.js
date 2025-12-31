import emailsData from '../data/emails.json'
import { suppliers, quotes, emailTemplates } from './demoData'
import { STAGES } from './demoState'

// Helper to create emails for different scenarios
function createScenarioEmails(scenarioType) {
  const baseEmails = [...emailsData]
  
  switch (scenarioType) {
    case 'fullDemo':
      return baseEmails
    
    case 'clarificationDemo':
      // Start with RFQ sent and clarification received
      return baseEmails.filter(e => 
        e.rfqId === 'RFQ-2024-0847' && 
        (e.rfqStatus === 'sent' || e.needsClarification === true || e.isQuote === true)
      )
    
    case 'quoteDemo':
      // Start with all quotes received
      return baseEmails.filter(e => 
        e.rfqId === 'RFQ-2024-0847' && 
        (e.isQuote === true || e.folder === 'sent')
      )
    
    default:
      return baseEmails
  }
}

export const scenarios = {
  // Main demo - full happy path
  fullDemo: {
    id: 'fullDemo',
    name: 'Complete Procurement Flow',
    description: 'Full end-to-end demo: RFQ → Suppliers → Quotes → PO',
    duration: '~5 minutes',
    icon: '',
    initialEmails: createScenarioEmails('fullDemo'),
    suppliers: suppliers,
    quotes: quotes,
    startStage: STAGES.INBOX,
  },
  
  // Start mid-flow - for shorter demos
  clarificationDemo: {
    id: 'clarificationDemo',
    name: 'Clarification Handling',
    description: 'Demo the human-in-the-loop clarification flow',
    duration: '~2 minutes',
    icon: '',
    initialEmails: createScenarioEmails('clarificationDemo'),
    suppliers: suppliers,
    quotes: quotes.filter(q => q.supplierId === 'acme-precision'),
    startStage: STAGES.CLARIFICATION,
  },
  
  // Quote comparison only
  quoteDemo: {
    id: 'quoteDemo',
    name: 'Quote Comparison',
    description: 'Jump to comparing supplier quotes',
    duration: '~2 minutes',
    icon: '',
    initialEmails: createScenarioEmails('quoteDemo'),
    suppliers: suppliers,
    quotes: quotes,
    startStage: STAGES.QUOTES_RECEIVED,
  },
}

export function getScenario(scenarioId) {
  return scenarios[scenarioId] || scenarios.fullDemo
}

export function getAllScenarios() {
  return Object.values(scenarios)
}

