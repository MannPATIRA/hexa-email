import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createEventTimeline, getNextEvent, EVENT_TYPES } from './timeProgression'

// Demo stages
export const STAGES = {
  INBOX: 'inbox',
  COMPOSE_RFQ: 'compose_rfq',
  PROCESSING: 'processing',
  SUPPLIER_MATCHING: 'supplier_matching',
  RFQS_SENT: 'rfqs_sent',
  CLARIFICATION: 'clarification',
  QUOTES_RECEIVED: 'quotes_received',
  COMPARISON: 'comparison',
  PO_GENERATION: 'po_generation',
  COMPLETE: 'complete'
}

// Stage order for navigation
export const STAGE_ORDER = [
  STAGES.INBOX,
  STAGES.COMPOSE_RFQ,
  STAGES.PROCESSING,
  STAGES.SUPPLIER_MATCHING,
  STAGES.RFQS_SENT,
  STAGES.CLARIFICATION,
  STAGES.QUOTES_RECEIVED,
  STAGES.COMPARISON,
  STAGES.PO_GENERATION,
  STAGES.COMPLETE
]

const DemoStateContext = createContext(null)

export function DemoStateProvider({ children, initialEmails = [], initialStage = null }) {
  // Process initial emails to ensure Sarah Chen's email is not an agent email
  // and remove any legacy figma verification emails
  const processedInitialEmails = initialEmails
    .filter(email => email.id !== 'figma-verify')
    .map(email => {
    // Reset Sarah Chen's email to non-agent state for fresh demo
    if (email.id === '1' || email.from?.includes('sarah.chen')) {
      return { ...email, isAgentEmail: false, rfqId: null }
    }
    return email
  })

  // Clear localStorage on mount to ensure fresh start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('procureflow-demo-state')
      localStorage.removeItem('procureflow-demo-emails')
      localStorage.removeItem('procureflow-demo-scenario')
    }
  }, [])

  // Always start fresh - don't load from localStorage
  const [currentStage, setCurrentStage] = useState(initialStage || STAGES.INBOX)
  const [currentRfqId, setCurrentRfqId] = useState(null)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [quotes, setQuotes] = useState([])
  const [clarifications, setClarifications] = useState({})
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [purchaseOrder, setPurchaseOrder] = useState(null)
  
  // UI state
  const [showProcessing, setShowProcessing] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [showPOGenerator, setShowPOGenerator] = useState(false)
  const [emails, setEmails] = useState(processedInitialEmails)
  
  // Agent processing states - always start fresh
  const [requirementsParsing, setRequirementsParsing] = useState(false)
  const [marketScanning, setMarketScanning] = useState(false)
  const [suppliersFound, setSuppliersFound] = useState([])
  const [draftRFQ, setDraftRFQ] = useState(null)
  const [pendingApproval, setPendingApproval] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Processing step states
  const [processingStep, setProcessingStep] = useState(null) // 'request_received', 'parsing', 'requirements_review', 'market_scan', 'supplier_selection', 'draft_rfq'
  const [requirementsReviewPending, setRequirementsReviewPending] = useState(false)
  const [parsedRequirements, setParsedRequirements] = useState(null)
  const [supplierSelectionPending, setSupplierSelectionPending] = useState(false)
  const [draftRFQPending, setDraftRFQPending] = useState(false)
  const [selectedSuppliersForRFQ, setSelectedSuppliersForRFQ] = useState([])
  const [generatingPO, setGeneratingPO] = useState(false)
  
  // Event timeline
  const eventTimeline = createEventTimeline(emails)
  const nextEvent = getNextEvent(eventTimeline, currentTime)

  const advanceToStage = useCallback((stage) => {
    setCurrentStage(stage)
    
    // Auto-manage UI state based on stage
    setShowProcessing(stage === STAGES.PROCESSING)
    setShowComparison(stage === STAGES.COMPARISON)
    setShowPOGenerator(stage === STAGES.PO_GENERATION)
  }, [])

  const submitRfq = useCallback((emailData) => {
    const rfqId = emailData.rfqId || `RFQ-2024-${String(Date.now()).slice(-4)}`
    setCurrentRfqId(rfqId)
    setSelectedEmail({ ...emailData, rfqId, isAgentEmail: true })
    advanceToStage(STAGES.PROCESSING)
  }, [advanceToStage])

  const answerClarification = useCallback((rfqId, answers) => {
    setClarifications(prev => ({
      ...prev,
      [rfqId]: answers
    }))
    // After answering, advance to quotes received stage
    advanceToStage(STAGES.QUOTES_RECEIVED)
  }, [advanceToStage])

  const selectSupplier = useCallback((supplierId) => {
    setSelectedSupplier(supplierId)
    setGeneratingPO(true)
    setShowPOGenerator(true)
    advanceToStage(STAGES.PO_GENERATION)
  }, [advanceToStage])

  const generatePO = useCallback((poData) => {
    setPurchaseOrder(poData)
    setGeneratingPO(false)
    advanceToStage(STAGES.COMPLETE)
  }, [advanceToStage])

  const skipToNextEvent = useCallback(() => {
    if (nextEvent) {
      setCurrentTime(nextEvent.timestamp)
      // Trigger email arrival animation or state update
      // The email should already exist in the emails array, just update visibility/read status
    }
  }, [nextEvent])

  const generateRFQBody = useCallback((rfqId, requirements) => {
    return `Dear Supplier Team,

We are requesting a quote for the following component:

**RFQ Number:** ${rfqId}
**Part:** ${requirements.partName}${requirements.partNumber ? ` (${requirements.partNumber})` : ''}
**Quantity:** ${requirements.quantity} units${requirements.annualVolume ? ` (Annual volume: ${requirements.annualVolume} units/year)` : ''}
**Material:** ${requirements.material}
**Delivery:** ${requirements.deliveryDate}

${requirements.specialRequirements ? `**Special Requirements:**\n${requirements.specialRequirements}\n\n` : ''}${requirements.itarRequired ? '**ITAR Compliance:** Domestic suppliers only (US-based manufacturing required)\n\n' : ''}Please provide:
- Unit price for ${requirements.quantity} pcs
- Tooling/NRE costs (if applicable)
- Lead time
- Payment terms
- Quality certifications

Please provide your quote at your earliest convenience.

Best regards,
ProcureFlow Agent
Procurement Department`
  }, [])

  const approveRequirements = useCallback((approvedRequirements) => {
    setParsedRequirements(approvedRequirements)
    setRequirementsReviewPending(false)
    setProcessingStep('market_scan')
    setMarketScanning(true)
  }, [])

  const selectSuppliersForRFQ = useCallback((suppliers) => {
    setSelectedSuppliersForRFQ(suppliers)
    setSupplierSelectionPending(false)
    setProcessingStep('draft_rfq')
    // Generate draft RFQ from requirements and selected suppliers
    if (parsedRequirements) {
      const rfqId = currentRfqId || `RFQ-2024-${String(Date.now()).slice(-4)}`
      setDraftRFQ({
        rfqId,
        partName: parsedRequirements.partName,
        partNumber: parsedRequirements.partNumber,
        quantity: parsedRequirements.quantity,
        annualVolume: parsedRequirements.annualVolume,
        material: parsedRequirements.material,
        deliveryDate: parsedRequirements.deliveryDate,
        specialRequirements: parsedRequirements.specialRequirements,
        itarRequired: parsedRequirements.itarRequired,
        subject: `RFQ-${rfqId}: ${parsedRequirements.partName} (${parsedRequirements.quantity} pcs)`,
        body: generateRFQBody(rfqId, parsedRequirements)
      })
      setDraftRFQPending(true)
    }
  }, [parsedRequirements, currentRfqId, generateRFQBody])

  const approveDraftRFQ = useCallback((approvedDraft, suppliers) => {
    setDraftRFQ(null)
    setDraftRFQPending(false)
    setProcessingStep(null)
    // This will trigger email generation in Layout component
    // Return the approved draft and suppliers for email generation
    return { draft: approvedDraft, suppliers: suppliers || selectedSuppliersForRFQ }
  }, [selectedSuppliersForRFQ])

  const resetDemo = useCallback(() => {
    setCurrentStage(STAGES.INBOX)
    setCurrentRfqId(null)
    setSelectedEmail(null)
    setSuppliers([])
    setQuotes([])
    setClarifications({})
    setSelectedSupplier(null)
    setPurchaseOrder(null)
    setShowProcessing(false)
    setShowComparison(false)
    setShowPOGenerator(false)
    setEmails(initialEmails)
    setRequirementsParsing(false)
    setMarketScanning(false)
    setSuppliersFound([])
    setDraftRFQ(null)
    setPendingApproval(false)
    setCurrentTime(new Date())
    setProcessingStep(null)
    setRequirementsReviewPending(false)
    setParsedRequirements(null)
    setSupplierSelectionPending(false)
    setDraftRFQPending(false)
    setSelectedSuppliersForRFQ([])
    setGeneratingPO(false)
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('procureflow-demo-state')
      localStorage.removeItem('procureflow-demo-emails')
      localStorage.removeItem('procureflow-demo-scenario')
    }
  }, [initialEmails])

  const loadScenario = useCallback((scenario) => {
    setCurrentStage(scenario.startStage)
    setEmails(scenario.initialEmails || initialEmails)
    setSuppliers(scenario.suppliers || [])
    setQuotes(scenario.quotes || [])
    setCurrentRfqId(null)
    setSelectedEmail(null)
    setClarifications({})
    setSelectedSupplier(null)
    setPurchaseOrder(null)
    setShowProcessing(false)
    setShowComparison(false)
    setShowPOGenerator(false)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('procureflow-demo-scenario', scenario.id)
      localStorage.setItem('procureflow-demo-emails', JSON.stringify(scenario.initialEmails || initialEmails))
    }
  }, [initialEmails])

  // Don't save to localStorage - always start fresh
  // (Removed auto-save to ensure clean demo start every time)

  const nextStage = useCallback(() => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage)
    if (currentIndex < STAGE_ORDER.length - 1) {
      advanceToStage(STAGE_ORDER[currentIndex + 1])
    }
  }, [currentStage, advanceToStage])

  const previousStage = useCallback(() => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage)
    if (currentIndex > 0) {
      advanceToStage(STAGE_ORDER[currentIndex - 1])
    }
  }, [currentStage, advanceToStage])

  const value = {
    // State
    currentStage,
    currentRfqId,
    selectedEmail,
    suppliers,
    quotes,
    clarifications,
    selectedSupplier,
    purchaseOrder,
    showProcessing,
    showComparison,
    showPOGenerator,
    requirementsParsing,
    marketScanning,
    suppliersFound,
    draftRFQ,
    pendingApproval,
    currentTime,
    nextEvent,
    eventTimeline,
    processingStep,
    requirementsReviewPending,
    parsedRequirements,
    supplierSelectionPending,
    draftRFQPending,
    selectedSuppliersForRFQ,
    generatingPO,
    
    // Actions
    advanceToStage,
    setSelectedEmail,
    submitRfq,
    answerClarification,
    selectSupplier,
    generatePO,
    resetDemo,
    loadScenario,
    nextStage,
    previousStage,
    skipToNextEvent,
    
    // Setters for direct state updates
    setSuppliers,
    setQuotes,
    setCurrentRfqId,
    setEmails,
    setRequirementsParsing,
    setMarketScanning,
    setSuppliersFound,
    setDraftRFQ,
    setPendingApproval,
    setCurrentTime,
    setProcessingStep,
    setRequirementsReviewPending,
    setParsedRequirements,
    setSupplierSelectionPending,
    setDraftRFQPending,
    setSelectedSuppliersForRFQ,
    setGeneratingPO,
    approveRequirements,
    selectSuppliersForRFQ,
    approveDraftRFQ,
    emails
  }

  return (
    <DemoStateContext.Provider value={value}>
      {children}
    </DemoStateContext.Provider>
  )
}

export function useDemoState() {
  const context = useContext(DemoStateContext)
  if (!context) {
    throw new Error('useDemoState must be used within DemoStateProvider')
  }
  return context
}

