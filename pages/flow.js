import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { DemoStateProvider, useDemoState, STAGES } from '../lib/demoState'
import Layout from '../components/Layout'
import AgentProcessing from '../components/AgentProcessing'
import QuoteComparison from '../components/QuoteComparison'
import POGenerator from '../components/POGenerator'
import DemoController from '../components/DemoController'
import emailsData from '../data/emails.json'

function FlowContent() {
  const router = useRouter()
  const {
    currentStage,
    currentRfqId,
    showProcessing,
    showComparison,
    showPOGenerator,
    selectedEmail,
    selectedSupplier,
    advanceToStage,
    submitRfq,
    answerClarification,
    selectSupplier,
    generatePO,
    setSelectedEmail,
    setEmails,
    emails
  } = useDemoState()

  // Auto-select Sarah Chen's email on mount - ensure it's not an agent email
  useEffect(() => {
    // Only run this on the flow page, not when navigating to email pages
    if (router.pathname !== '/flow') return
    
    if (emails.length > 0 && !selectedEmail) {
      // Find Sarah Chen's email (first email from sarah.chen that's not already an agent email)
      let sarahEmail = emails.find(e => 
        (e.id === '1' || e.from?.includes('sarah.chen')) && 
        !e.isAgentEmail
      )
      
      // If not found, find it anyway and reset its agent status
      if (!sarahEmail) {
        sarahEmail = emails.find(e => e.id === '1' || e.from?.includes('sarah.chen'))
        if (sarahEmail) {
          // Reset to non-agent email
          const resetEmail = { ...sarahEmail, isAgentEmail: false, rfqId: null }
          setSelectedEmail(resetEmail)
          // Update emails array
          if (setEmails) {
            setEmails(emails.map(e => e.id === resetEmail.id ? resetEmail : e))
          }
        }
      } else {
        setSelectedEmail(sarahEmail)
      }
      
      // Also update URL - use push instead of replace with shallow for cross-page navigation
      if (sarahEmail && typeof window !== 'undefined' && router && router.isReady) {
        router.push(`/email/${sarahEmail.id}`)
      }
    }
  }, [emails, selectedEmail, setSelectedEmail, router])

  // Expose demo state to window
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.demoState = {
        currentStage,
        currentRfqId,
        showProcessing,
        showComparison,
        selectedEmail,
        advanceToStage,
        submitRfq,
        answerClarification,
        selectSupplier,
        generatePO,
        STAGES
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.demoState
      }
    }
  }, [currentStage, currentRfqId, showProcessing, showComparison, selectedEmail, advanceToStage, submitRfq, answerClarification, selectSupplier, generatePO])

  // Handle processing completion
  const handleProcessingComplete = () => {
    advanceToStage(STAGES.RFQS_SENT)
  }

  // Handle comparison supplier selection
  const handleSupplierSelect = (supplierId) => {
    selectSupplier(supplierId)
  }


  // Render based on current stage
  if (showProcessing && currentRfqId) {
    return (
      <>
        <AgentProcessing
          rfqId={currentRfqId}
          partName={selectedEmail?.subject?.replace('RFQ Request - ', '').split(' - ')[0] || 'Part'}
          onComplete={handleProcessingComplete}
          onSkip={handleProcessingComplete}
        />
        <DemoController />
      </>
    )
  }

  if (showComparison && currentRfqId) {
    return (
      <>
        <Layout emails={emails} />
        <QuoteComparison
          rfqId={currentRfqId}
          emails={emails}
          onClose={() => advanceToStage(STAGES.QUOTES_RECEIVED)}
          onSelectSupplier={handleSupplierSelect}
        />
        <DemoController />
      </>
    )
  }

  if (showPOGenerator && currentRfqId && selectedSupplier) {
    return (
      <>
        <Layout emails={emails} />
        <POGenerator
          rfqId={currentRfqId}
          selectedEmail={selectedEmail}
          selectedSupplier={selectedSupplier}
          onApprove={generatePO}
          onClose={() => advanceToStage(STAGES.QUOTES_RECEIVED)}
        />
        <DemoController />
      </>
    )
  }

  // Default: show email client
  // Pass emails from demoState to Layout so it stays in sync
  return (
    <>
      <Layout emails={emails} />
      <DemoController />
    </>
  )
}

export default function Flow() {
  return (
    <DemoStateProvider initialEmails={emailsData}>
      <FlowContent />
    </DemoStateProvider>
  )
}

