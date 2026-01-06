import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'
import { useDemoState } from '../lib/demoState'
import RequirementsViewer from './RequirementsViewer'
import SupplierListModal from './SupplierListModal'
import RFQDraftModal from './RFQDraftModal'
import { suppliers } from '../lib/demoData'
import { getThreadEmails } from '../lib/emailUtils'

function getStatusInfo(rfqStatus, needsClarification) {
  if (needsClarification) {
    return { label: 'Needs Input', color: 'yellow', dot: 'bg-yellow-400' }
  }
  if (rfqStatus === 'complete') {
    return { label: 'Complete', color: 'green', dot: 'bg-green-500' }
  }
  return { label: 'In Progress', color: 'blue', dot: 'bg-blue-500' }
}

function calculateDaysUntil(dateString) {
  const targetDate = new Date(dateString)
  const today = new Date()
  const diffTime = targetDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function formatDueDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getProgressSteps(email, demoState, emails) {
  const rfqId = email.rfqId
  const rfqEmails = demoState?.emails?.filter(e => e.rfqId === rfqId) || []
  
  // Request Received should always be green if this is an agent email or has an RFQ ID
  const hasRequest = email.isAgentEmail || email.rfqId || rfqEmails.some(e => e.from?.includes('sarah.chen') && !e.isAgentEmail) || email.from?.includes('sarah.chen')
  
  // RFQ Sent - only count original RFQs (threadIndex === 0 or undefined)
  const sentCount = rfqEmails.filter(e => 
    e.rfqStatus === 'sent' && 
    (e.threadIndex === 0 || e.threadIndex === undefined)
  ).length
  const totalRFQs = demoState?.suppliersFound?.length || 4
  const allRFQsSent = sentCount >= totalRFQs && totalRFQs > 0
  
  // Clarifications - count unanswered ones
  const clarificationCount = rfqEmails.filter(e => {
    if (!e.needsClarification || e.threadIndex !== 1) return false
    const threadId = e.threadId
    if (!threadId) return true // No thread ID means it's unanswered
    const threadEmails = getThreadEmails(emails || demoState?.emails || [], threadId)
    const hasResponse = threadEmails.some(t => t.threadIndex === 2 || t.needsEngineerReview === true)
    return !hasResponse
  }).length
  
  const hasQuotes = rfqEmails.some(e => e.isQuote === true)
  const quoteCount = rfqEmails.filter(e => e.isQuote === true).length
  
  // Determine current step based on processingStep
  const processingStep = demoState?.processingStep
  const isRequestReceived = processingStep === 'request_received' || hasRequest
  const isParsing = processingStep === 'parsing' || demoState?.requirementsParsing
  const isRequirementsReview = processingStep === 'requirements_review' || demoState?.requirementsReviewPending
  const isMarketScanning = processingStep === 'market_scan' || demoState?.marketScanning
  const isSupplierSelection = processingStep === 'supplier_selection' || demoState?.supplierSelectionPending
  const isDraftRFQ = processingStep === 'draft_rfq' || demoState?.draftRFQPending
  
  // Check if supplier is selected or comparison is shown
  const supplierSelected = demoState?.selectedSupplier !== null
  const showComparison = demoState?.showComparison === true
  const poGenerated = demoState?.purchaseOrder !== null || email.rfqStatus === 'complete'

  const steps = [
    { 
      id: 'request', 
      label: 'Request Received', 
      completed: true, // Always green if this is an agent email or has RFQ ID
      current: false
    },
    { 
      id: 'parsed', 
      label: 'Requirements Parsed', 
      completed: !!demoState?.parsedRequirements && !isRequirementsReview, 
      current: isParsing || isRequirementsReview 
    },
    { 
      id: 'suppliers', 
      label: 'Suppliers Identified', 
      completed: (demoState?.suppliersFound?.length > 0) || allRFQsSent, 
      current: isMarketScanning || isSupplierSelection 
    },
    { 
      id: 'draft', 
      label: 'Draft RFQ', 
      completed: (demoState?.draftRFQ !== null) || allRFQsSent, 
      current: isDraftRFQ 
    },
    { 
      id: 'sent', 
      label: `RFQs Sent (${sentCount}/${totalRFQs})`, 
      completed: allRFQsSent, 
      current: sentCount > 0 && !allRFQsSent,
      count: sentCount, 
      total: totalRFQs 
    },
    { 
      id: 'clarification', 
      label: `Clarifications${clarificationCount > 0 ? ` (${clarificationCount})` : ''}`, 
      completed: clarificationCount === 0 && sentCount > 0, // Only green when no unanswered clarifications
      pending: clarificationCount > 0, // Yellow when there are unanswered clarifications
      count: clarificationCount 
    },
    { 
      id: 'quotes', 
      label: 'Quotes Received', 
      completed: quoteCount >= 3 || supplierSelected, 
      current: quoteCount >= 1 && quoteCount < 3 && !supplierSelected,
      pending: quoteCount >= 1 && quoteCount < 3, // Yellow as soon as one is received
      count: quoteCount, 
      total: 3 
    },
    { 
      id: 'evaluation', 
      label: 'Evaluation', 
      completed: supplierSelected || showComparison || poGenerated, 
      current: quoteCount >= 1 && !supplierSelected && !showComparison 
    },
    { 
      id: 'po', 
      label: 'PO Generated', 
      completed: poGenerated, 
      current: demoState?.showPOGenerator || demoState?.generatingPO 
    }
  ]

  return steps
}

export default function AgentContextPanel({ email, emails, onCompareQuotes }) {
  const [showRequirements, setShowRequirements] = useState(false)
  const [showSuppliers, setShowSuppliers] = useState(false)
  const [showDraftRFQ, setShowDraftRFQ] = useState(false)
  
  // Try to get demo state for processing animations
  let demoState = null
  try {
    demoState = useDemoState()
  } catch (e) {
    // Not in demo mode
  }
  
  const requirementsParsing = demoState?.requirementsParsing || false
  const marketScanning = demoState?.marketScanning || false
  const suppliersFound = demoState?.suppliersFound || []
  const draftRFQ = demoState?.draftRFQ || null
  const pendingApproval = demoState?.pendingApproval || false

  if (!email || !email.isAgentEmail) return null

  const rfqId = email.rfqId || 'RFQ-XXXX-XXXX'
  const statusInfo = getStatusInfo(email.rfqStatus, email.needsClarification)
  
  // Extract part name from subject or body
  const partNameMatch = email.subject.match(/- (.+?) -/) || email.body.match(/\*\*Part Name:\*\* (.+?)\n/)
  const partName = partNameMatch ? partNameMatch[1] : 'Part Name'
  
  // Extract requester from email
  const requesterMatch = email.from.match(/([^@]+)@/) || email.body.match(/([A-Z][a-z]+ [A-Z][a-z]+)/)
  const requester = requesterMatch ? requesterMatch[1] : 'Engineering'
  
  // Calculate due date (8 weeks from request date)
  const requestDate = new Date(email.date)
  const dueDate = new Date(requestDate)
  dueDate.setDate(dueDate.getDate() + 56) // 8 weeks = 56 days
  const daysUntil = calculateDaysUntil(dueDate)
  const dueDateFormatted = formatDueDate(dueDate)
  
  const progressSteps = getProgressSteps(email, demoState, emails)
  const currentStepIndex = progressSteps.findIndex(step => step.current || (!step.completed && step.id !== 'request'))
  const hasClarification = email.needsClarification || emails.some(e => e.rfqId === rfqId && e.needsClarification)
  const hasQuotes = email.isQuote || emails.some(e => e.rfqId === rfqId && e.isQuote)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-80 bg-outlook-surface border-l border-white/5 h-full overflow-y-auto scrollbar-custom"
    >
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-white tracking-tight">Procurement Agent</h2>
          <div className="flex items-center space-x-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-semibold text-green-500 uppercase tracking-wide">Active Status</span>
          </div>
        </div>

        {/* RFQ Summary Card */}
        <div className="bg-outlook-bg rounded p-5 border border-outlook-border">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-outlook-border/50">
            <h3 className="font-semibold text-white text-[13px] tracking-tight">{rfqId}</h3>
            <div className="flex items-center space-x-2">
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
              <span className="text-[10px] font-semibold text-outlook-text-secondary uppercase tracking-wide">{statusInfo.label}</span>
            </div>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[10px] font-medium text-outlook-text-tertiary uppercase tracking-wide mb-1">Part Designation</p>
              <p className="text-white font-semibold truncate text-[13px]">{partName}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-outlook-text-tertiary uppercase tracking-wide mb-1">Requester</p>
              <p className="text-white font-medium text-[13px]">{requester}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-outlook-text-tertiary uppercase tracking-wide mb-1">Maturity Date</p>
              <div className="flex items-center space-x-2">
                <p className="text-white font-medium text-[13px]">{dueDateFormatted}</p>
                <span className="text-[9px] font-bold text-outlook-blue bg-outlook-blue/10 px-1.5 py-0.5 rounded tracking-tighter">{daysUntil}D LEFT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Request Received Section */}
        {demoState?.processingStep === 'request_received' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-900/20 border border-green-500/30 rounded p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-[13px] font-semibold text-green-400">Request Received</h4>
            </div>
            <p className="text-xs text-green-300">Processing your RFQ request...</p>
          </motion.div>
        )}

        {/* Requirements Parsing Section */}
        {requirementsParsing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-outlook-blue/10 border border-outlook-blue/30 rounded p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-1.5 h-1.5 bg-outlook-blue rounded-full animate-pulse"></div>
              <h4 className="text-[13px] font-semibold text-outlook-blue">Parsing Requirements...</h4>
            </div>
            <div className="space-y-2 text-[11px] text-outlook-text-secondary">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-outlook-blue rounded-full opacity-50"></div>
                <span>Extracting part details...</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-outlook-blue rounded-full opacity-50"></div>
                <span>Analyzing specifications...</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-outlook-blue rounded-full opacity-50"></div>
                <span>Processing attachments...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Market Scan Section */}
        {marketScanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-900/20 border border-green-500/30 rounded p-4"
          >
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <h4 className="text-[13px] font-semibold text-green-400">Scanning Market...</h4>
            </div>
            <div className="mb-3">
              <div className="w-full bg-green-900/40 rounded-full h-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'easeInOut' }}
                  className="bg-green-500 h-full rounded-full"
                />
              </div>
            </div>
            {suppliersFound.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[11px] text-green-300 font-medium">Found {suppliersFound.length} suppliers:</p>
                {suppliersFound.map((supplier, index) => (
                  <motion.div
                    key={supplier.id || index}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-[11px] text-green-300/80 flex items-center space-x-2"
                  >
                    <span className="w-1 h-1 bg-green-500 rounded-full opacity-50"></span>
                    <span>{supplier.name || supplier.email}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-green-300">Searching supplier database...</p>
            )}
          </motion.div>
        )}

        {/* Draft RFQ Section */}
        {draftRFQ && !pendingApproval && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-yellow-900/20 border border-yellow-500/30 rounded p-4"
          >
            <h4 className="text-[13px] font-semibold text-yellow-400 mb-2">Draft RFQ Ready</h4>
            <p className="text-xs text-yellow-300/80 mb-3">Review and approve the RFQ before sending to suppliers.</p>
            <Button
              variant="primary"
              onClick={() => setShowDraftRFQ(true)}
              className="w-full text-[11px] font-bold uppercase tracking-wide"
            >
              Review Draft
            </Button>
          </motion.div>
        )}

        {/* Progress Tracker */}
        <div>
          <h4 className="text-[11px] font-semibold text-outlook-text-secondary uppercase tracking-wider mb-5 pb-2 border-b border-outlook-border/30">Intelligence Progress</h4>
          <div className="space-y-0">
            {progressSteps.map((step, index) => {
              const isLast = index === progressSteps.length - 1
              const isCurrent = step.current || (index === currentStepIndex && !step.completed && !step.pending)
              
              return (
                <div key={step.id} className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    {step.completed ? (
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : step.pending ? (
                      <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full bg-outlook-blue flex items-center justify-center">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-1 h-1 rounded-full bg-white" 
                        />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-outlook-border bg-black/20"></div>
                    )}
                    {!isLast && (
                      <div className={`w-px h-7 mt-1 ${step.completed ? 'bg-green-500/50' : 'bg-outlook-border'}`}></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className={`text-[12px] font-medium ${step.completed ? 'text-outlook-text-tertiary line-through' : step.pending ? 'text-yellow-500' : isCurrent ? 'text-white font-semibold' : 'text-outlook-text-secondary'}`}>
                      {step.label}
                      {step.count !== undefined && step.count > 0 && (
                        <span className="text-outlook-text-tertiary ml-1.5 font-normal">
                          ({step.count}{step.total ? `/${step.total}` : ''})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-[11px] font-semibold text-outlook-text-secondary uppercase tracking-wider mb-4 pb-2 border-b border-outlook-border/30">Tactical Actions</h4>
          <div className="space-y-2">
            {hasClarification && (
              <Button
                variant="primary"
                onClick={() => {
                  const clarificationEl = document.querySelector('[data-clarification-interface]')
                  if (clarificationEl) {
                    clarificationEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
                className="w-full text-[11px] font-bold py-2 uppercase tracking-wide"
              >
                Answer Queries
              </Button>
            )}
            {hasQuotes && (
              <Button
                variant="primary"
                onClick={() => {
                  if (demoState) {
                    demoState.advanceToStage(demoState.STAGES?.COMPARISON || 'comparison')
                  } else if (typeof window !== 'undefined' && window.demoState) {
                    window.demoState.advanceToStage(window.demoState.STAGES?.COMPARISON || 'comparison')
                  }
                  if (onCompareQuotes) {
                    onCompareQuotes()
                  }
                }}
                className="w-full text-[11px] font-bold py-2 uppercase tracking-wide"
              >
                Compare Quotes
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => setShowSuppliers(true)}
              className="w-full text-[11px] font-semibold py-2 uppercase tracking-wide"
            >
              Supplier Directory
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowRequirements(true)}
              className="w-full text-[11px] font-semibold py-2 uppercase tracking-wide"
            >
              View Requirements
            </Button>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showRequirements && (
          <RequirementsViewer
            email={email}
            onClose={() => setShowRequirements(false)}
          />
        )}
        {showSuppliers && (
          <SupplierListModal
            onClose={() => setShowSuppliers(false)}
          />
        )}
        {showDraftRFQ && draftRFQ && (
          <RFQDraftModal
            draftRFQ={draftRFQ}
            suppliers={suppliersFound.length > 0 ? suppliersFound : suppliers}
            onApprove={() => {
              if (demoState) {
                demoState.setPendingApproval(false)
                demoState.setDraftRFQ(null)
                // Generate and send RFQs
                demoState.advanceToStage(demoState.STAGES?.RFQS_SENT || 'rfqs_sent')
              }
              setShowDraftRFQ(false)
            }}
            onEdit={() => {
              // TODO: Open edit modal
              setShowDraftRFQ(false)
            }}
            onClose={() => setShowDraftRFQ(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

