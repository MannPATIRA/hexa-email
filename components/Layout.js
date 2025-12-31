import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Header from './Header'
import Sidebar from './Sidebar'
import EmailList from './EmailList'
import ReadingPane from './ReadingPane'
import ComposeModal from './ComposeModal'
import QuoteComparison from './QuoteComparison'
import AgentProcessing from './AgentProcessing'
import POGenerator from './POGenerator'
import ResizablePane from './ResizablePane'
import RequirementsReviewModal from './RequirementsReviewModal'
import SupplierSelectionModal from './SupplierSelectionModal'
import RFQDraftModal from './RFQDraftModal'
import SimulateRepliesButton from './SimulateRepliesButton'
import emailsData from '../data/emails.json'
import foldersData from '../data/folders.json'
import { filterEmailsByFolder, filterEmailsBySearch, extractPartNameFromEmail, getPartNameFromRfq, getThreadId } from '../lib/emailUtils'
import { useDemoState, STAGES } from '../lib/demoState'
import { suppliers, emailTemplates } from '../lib/demoData'

export default function Layout({ children, emails: propEmails }) {
  const router = useRouter()
  
  // Try to use demo state if available (for demo mode)
  let demoState = null
  try {
    demoState = useDemoState()
  } catch (e) {
    // Not in demo mode, continue with local state
    console.log('Demo state not available, using local state')
  }
  
  // Use prop emails if provided (demo mode), otherwise use local state
  const [localEmails, setLocalEmails] = useState(emailsData)
  const emails = propEmails || (demoState?.emails) || localEmails
  const setEmails = propEmails ? (demoState?.setEmails || (() => {})) : setLocalEmails
  
  const [folders] = useState(foldersData)
  const [currentFolder, setCurrentFolder] = useState('inbox')
  // Use demo state selected email if available, otherwise use local state
  const [localSelectedEmail, setLocalSelectedEmail] = useState(null)
  const selectedEmail = demoState?.selectedEmail || localSelectedEmail
  const setSelectedEmail = demoState?.setSelectedEmail || setLocalSelectedEmail
  const [searchQuery, setSearchQuery] = useState('')
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [showQuoteComparison, setShowQuoteComparison] = useState(false)
  const [showAgentProcessing, setShowAgentProcessing] = useState(false)
  const [processingRFQ, setProcessingRFQ] = useState(null)
  const [showRequirementsReview, setShowRequirementsReview] = useState(false)
  const [showSupplierSelection, setShowSupplierSelection] = useState(false)
  const [showRFQDraft, setShowRFQDraft] = useState(false)
  const [hasSimulatedReplies, setHasSimulatedReplies] = useState(false)

  // Load emails from localStorage on mount (only if not using prop emails)
  useEffect(() => {
    if (propEmails) return // Skip if using prop emails (demo mode)
    
    const savedEmails = localStorage.getItem('procureflow-emails')
    if (savedEmails) {
      try {
        setLocalEmails(JSON.parse(savedEmails))
      } catch (e) {
        console.error('Failed to load emails from localStorage', e)
      }
    }
  }, [propEmails])

  // Save emails to localStorage whenever they change (only if not using prop emails)
  useEffect(() => {
    if (propEmails) return // Skip if using prop emails (demo mode)
    localStorage.setItem('procureflow-emails', JSON.stringify(emails))
  }, [emails, propEmails])

  // Helper function to determine folder for an email
  const getFolderForEmail = useCallback((email) => {
    if (!email) return 'inbox'
    
    // If it's an agent email with RFQ ID, determine the part folder
    if (email.isAgentEmail && email.rfqId) {
      // Get part name from email or extract it
      const partName = email.partName || getPartNameFromRfq(emails, email.rfqId) || extractPartNameFromEmail(email)
      
      if (partName) {
        // Normalize part name to match folder ID format (same as getPartFolders)
        const normalizedPartName = partName
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        const baseId = `agent-part-${normalizedPartName}`
        
        // Determine subfolder based on email properties (priority order matters)
        // Check for clarification requests first
        if (email.needsClarification && email.threadIndex === 1) {
          return `${baseId}-clarifications`
        }
        // Check for quotes
        else if (email.isQuote && email.threadIndex === 1) {
          return `${baseId}-quotes`
        }
        // Check for original RFQ emails (threadIndex === 0 or undefined)
        else if (email.rfqStatus === 'sent' && (email.threadIndex === 0 || email.threadIndex === undefined) && !email.needsClarification && !email.isQuote) {
          return `${baseId}-sent`
        }
        // Check for awaiting responses (our responses, forwards, or threads with responses)
        else if (email.rfqStatus === 'sent' || email.threadIndex === 2 || email.needsEngineerReview) {
          return `${baseId}-awaiting`
        }
      }
    }
    
    // Fallback to standard folder
    return email.folder || 'inbox'
  }, [emails])

  // Handle email selection from URL (e.g., /email/[id])
  // This needs to run BEFORE filteredEmails is calculated, so we use a ref to track initial load
  const [initialFolderSet, setInitialFolderSet] = useState(false)
  
  useEffect(() => {
    if (router.query.id && router.isReady && !initialFolderSet) {
      const emailId = router.query.id
      const email = emails.find(e => e.id === emailId)
      if (email) {
        // Determine and set the correct folder for this email on initial load only
        const emailFolder = getFolderForEmail(email)
        setCurrentFolder(emailFolder)
        setSelectedEmail(email)
        setInitialFolderSet(true)
        
        // Mark as read when opened from URL
        if (!email.read) {
          if (demoState?.setEmails) {
            demoState.setEmails(emails.map(e => e.id === emailId ? { ...e, read: true } : e))
          } else {
            setEmails(emails.map(e => e.id === emailId ? { ...e, read: true } : e))
          }
        }
      }
    } else if (!router.query.id && initialFolderSet) {
      // Reset when navigating away from email detail
      setInitialFolderSet(false)
    }
  }, [router.query.id, router.isReady, emails, setSelectedEmail, setEmails, demoState, initialFolderSet, getFolderForEmail])

  const handleFolderSelect = (folderId) => {
    if (folderId === 'compose') {
      setIsComposeOpen(true)
      return
    }
    setCurrentFolder(folderId)
    // Don't clear selected email when switching folders - keep it visible if it matches the new folder
    // Only clear if the selected email doesn't belong to the current folder context
    if (selectedEmail) {
      let emailMatchesFolder = false
      
      // Check if folder is a part-based folder
      if (folderId.startsWith('agent-part-')) {
        const parts = folderId.split('-')
        if (parts.length >= 4) {
          const partNameParts = parts.slice(2, -1)
          const partName = partNameParts.join(' ').replace(/-/g, ' ')
          const subfolder = parts[parts.length - 1]
          
          // Check if email belongs to this part
          const emailPartName = selectedEmail.partName || extractPartNameFromEmail(selectedEmail)
          if (emailPartName) {
            const normalizedEmailPart = emailPartName.toLowerCase().replace(/\s+/g, ' ')
            const normalizedTargetPart = partName.toLowerCase().replace(/\s+/g, ' ')
            
            if (normalizedEmailPart === normalizedTargetPart) {
              // Check subfolder match
              switch (subfolder) {
                case 'sent':
                  // Must be original RFQ (threadIndex === 0 or undefined)
                  const isOriginal = selectedEmail.threadIndex === 0 || selectedEmail.threadIndex === undefined
                  emailMatchesFolder = selectedEmail.isAgentEmail && 
                                       selectedEmail.rfqStatus === 'sent' && 
                                       isOriginal &&
                                       !selectedEmail.needsClarification && 
                                       !selectedEmail.isQuote
                  break
                case 'awaiting':
                  // Can be original RFQ with no responses, or our response (threadIndex === 2), or forward (needsEngineerReview)
                  emailMatchesFolder = selectedEmail.isAgentEmail && 
                                       (selectedEmail.rfqStatus === 'sent' || 
                                        selectedEmail.threadIndex === 2 || 
                                        selectedEmail.needsEngineerReview === true)
                  break
                case 'clarifications':
                  emailMatchesFolder = selectedEmail.needsClarification === true && selectedEmail.threadIndex === 1
                  break
                case 'quotes':
                  emailMatchesFolder = selectedEmail.isQuote === true && selectedEmail.threadIndex === 1
                  break
              }
            }
          }
        }
      } else {
        // Legacy folder matching
        emailMatchesFolder = 
          folderId === 'agent-active' ? (selectedEmail.isAgentEmail && selectedEmail.rfqStatus && selectedEmail.rfqStatus !== 'complete') :
          folderId === 'agent-queue' ? selectedEmail.needsClarification === true :
          folderId === 'agent-complete' ? selectedEmail.rfqStatus === 'complete' :
          selectedEmail.folder === folderId
      }
      
      if (!emailMatchesFolder) {
        setSelectedEmail(null)
        // Clear email from URL when switching to a folder that doesn't contain the selected email
        if (router.pathname.startsWith('/email/')) {
          router.replace('/inbox', undefined, { shallow: true })
        }
      }
    }
    setSearchQuery('')
  }

  const handleEmailSelect = (email) => {
    // Set selected email immediately - DON'T change the folder
    // The folder should stay as the user selected it
    setSelectedEmail(email)
    // Update URL when email is selected (use replace to avoid adding to history)
    router.replace(`/email/${email.id}`, undefined, { shallow: true })
    // Mark as read when selected
    if (!email.read) {
      if (demoState?.setEmails) {
        demoState.setEmails(prevEmails => prevEmails.map(e => e.id === email.id ? { ...e, read: true } : e))
      } else {
        setEmails(prevEmails => prevEmails.map(e => e.id === email.id ? { ...e, read: true } : e))
      }
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query) {
      setSelectedEmail(null)
    }
  }

  const handleDelete = (emailId) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, folder: 'deleted' } : e
    ))
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null)
    }
  }

  const handleArchive = (emailId) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, folder: 'archive' } : e
    ))
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null)
    }
  }

  const handleMarkRead = (emailId) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, read: !e.read } : e
    ))
    if (selectedEmail?.id === emailId) {
      setSelectedEmail({ ...selectedEmail, read: !selectedEmail.read })
    }
  }

  const handleSend = (newEmail) => {
    setEmails([newEmail, ...emails])
    
    // If it's an RFQ email, show processing view
    if (newEmail.isAgentEmail && newEmail.rfqId) {
      setProcessingRFQ({
        rfqId: newEmail.rfqId,
        partName: newEmail.subject.replace('RFQ Request - ', '').split(' - ')[0] || 'Part'
      })
      setShowAgentProcessing(true)
      setIsComposeOpen(false)
      
      // If demo state is available, trigger it
      if (window.demoState?.submitRfq) {
        window.demoState.submitRfq(newEmail)
      }
    }
  }

  // Helper function to get supplier name from email
  const getSupplierName = (email) => {
    const supplier = suppliers.find(s => s.email === email)
    return supplier ? supplier.name : email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  // Simulate replies function
  const simulateReplies = useCallback((rfqId) => {
    if (!demoState) return
    
    // Get all sent RFQ emails for this RFQ - only original RFQs (threadIndex === 0 or undefined)
    const sentRFQs = emails.filter(e => {
      const isOriginal = e.threadIndex === 0 || e.threadIndex === undefined
      return e.rfqId === rfqId && 
             e.isAgentEmail === true && 
             e.rfqStatus === 'sent' &&
             isOriginal &&
             !e.needsClarification &&
             !e.isQuote
    })
    
    if (sentRFQs.length < 4) {
      console.warn('Need at least 4 sent RFQs to simulate replies')
      return
    }
    
    // Shuffle and select 2 for clarifications, 2 for quotes
    const shuffled = [...sentRFQs].sort(() => Math.random() - 0.5)
    const clarificationEmails = shuffled.slice(0, 2)
    const quoteEmails = shuffled.slice(2, 4)
    
    const partName = getPartNameFromRfq(emails, rfqId) || extractPartNameFromEmail(selectedEmail) || 'Part'
    
    // Generate clarification emails
    const clarificationEmailsGenerated = clarificationEmails.map((sentEmail, index) => {
      const supplierEmail = sentEmail.to
      const supplierName = getSupplierName(supplierEmail)
      const threadId = sentEmail.threadId || getThreadId(rfqId, supplierEmail)
      
      // Sample clarification questions
      const clarificationQuestions = [
        {
          id: `q1-${index}`,
          question: 'Can you clarify the surface finish requirement? The drawing shows Ra 1.6 µm, but we want to confirm if this applies to all surfaces or just the critical bores.',
          agentSuggestion: 'Ra 1.6 µm applies to all machined surfaces. Critical bores (M10x1.0 ports) require Ra 0.8 µm per drawing note 3.',
          agentReasoning: 'The drawing specifies Ra 1.6 µm for general surfaces, but note 3 indicates tighter tolerance for critical bores.',
          confidence: 'high',
          category: 'Surface Finish'
        },
        {
          id: `q2-${index}`,
          question: 'For the leak test at 3000 PSI, do you require certification documentation, or is a pass/fail result sufficient?',
          agentSuggestion: 'Certification documentation is required. Please provide test report with date, operator name, and test pressure held for minimum 30 seconds.',
          agentReasoning: 'ITAR compliance and quality requirements typically need documented test results.',
          confidence: 'high',
          category: 'Testing Requirements'
        }
      ]
      
      return {
        id: `clarification-${rfqId}-${index}-${Date.now()}`,
        subject: `RE: RFQ-${rfqId} - Clarification Needed`,
        from: supplierEmail,
        to: 'procurement-agent@company.com',
        date: new Date().toISOString(),
        body: emailTemplates.clarificationEmail({
          rfqId: `RFQ-${rfqId}`,
          supplierName: supplierName,
          questions: clarificationQuestions.map(q => ({
            category: q.category,
            question: q.question
          }))
        }),
        read: false,
        folder: 'inbox',
        attachments: [],
        isAgentEmail: true,
        rfqId: rfqId,
        needsClarification: true,
        clarificationQuestions: clarificationQuestions,
        partName: partName,
        threadId: threadId, // Link to original RFQ thread
        inReplyTo: sentEmail.id, // Reply to original RFQ email
        threadIndex: 1 // First response in thread
      }
    })
    
    // Generate quote emails
    const quoteEmailsGenerated = quoteEmails.map((sentEmail, index) => {
      const supplierEmail = sentEmail.to
      const supplier = suppliers.find(s => s.email === supplierEmail)
      const supplierName = supplier ? supplier.name : getSupplierName(supplierEmail)
      const threadId = sentEmail.threadId || getThreadId(rfqId, supplierEmail)
      
      // Use quote data from demoData or generate defaults
      const quoteData = {
        unitPrice: [87.50, 92.00, 79.95, 85.00][index] || 85.00,
        tooling: [2500, 1800, 3200, 2000][index] || 2000,
        leadTime: ['7 weeks', '6.5 weeks', '8 weeks', '7.5 weeks'][index] || '7 weeks',
        terms: ['Net 30', '50% deposit, 50% on delivery', 'Net 45', 'Net 30'][index] || 'Net 30',
        notes: supplier?.capabilities?.[0] || 'Standard manufacturing practices apply',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
      
      // Extract quantity from original RFQ
      const quantity = selectedEmail?.body?.match(/Initial Quantity:\s*(\d+)/i)?.[1] || '150'
      
      return {
        id: `quote-${rfqId}-${index}-${Date.now()}`,
        subject: `Quote - RFQ-${rfqId} [${supplierName}]`,
        from: supplierEmail,
        to: 'procurement-agent@company.com',
        date: new Date().toISOString(),
        body: emailTemplates.quoteResponse({
          rfqId: `RFQ-${rfqId}`,
          supplierName: supplierName,
          unitPrice: quoteData.unitPrice,
          tooling: quoteData.tooling,
          leadTime: quoteData.leadTime,
          terms: quoteData.terms,
          quantity: quantity,
          notes: quoteData.notes
        }),
        read: false,
        folder: 'inbox',
        attachments: [],
        isAgentEmail: true,
        rfqId: rfqId,
        isQuote: true,
        quoteData: quoteData,
        partName: partName,
        threadId: threadId, // Link to original RFQ thread
        inReplyTo: sentEmail.id, // Reply to original RFQ email
        threadIndex: 1 // First response in thread
      }
    })
    
    // Add all generated emails
    const newEmails = [...clarificationEmailsGenerated, ...quoteEmailsGenerated]
    demoState.setEmails(prevEmails => [...newEmails, ...prevEmails])
    
    // Mark as simulated
    setHasSimulatedReplies(true)
  }, [demoState, emails, selectedEmail])

  // Check if we should show the simulate replies button
  const shouldShowSimulateButton = () => {
    if (!demoState || hasSimulatedReplies) return false
    
    // Check if there are any sent RFQs
    const sentRFQs = emails.filter(e => 
      e.isAgentEmail === true && 
      e.rfqStatus === 'sent' &&
      !e.needsClarification &&
      !e.isQuote
    )
    
    return sentRFQs.length >= 4
  }

  // Get current RFQ ID for simulate button
  const getCurrentRfqId = useCallback(() => {
    // Find original RFQ (threadIndex === 0 or undefined)
    const sentRFQ = emails.find(e => {
      const isOriginal = e.threadIndex === 0 || e.threadIndex === undefined
      return e.isAgentEmail === true && 
             e.rfqId &&
             e.rfqStatus === 'sent' &&
             isOriginal &&
             !e.needsClarification &&
             !e.isQuote
    })
    return sentRFQ?.rfqId || demoState?.currentRfqId
  }, [emails, demoState])

  // Filter emails based on folder and search
  // Use currentFolder directly - don't override with URL email folder
  let filteredEmails = filterEmailsByFolder(emails, currentFolder)
  if (searchQuery) {
    filteredEmails = filterEmailsBySearch(filteredEmails, searchQuery)
  } else {
    // Sort by date (newest first), but prioritize Sarah Chen's email if it's not an agent email
    filteredEmails = [...filteredEmails].sort((a, b) => {
      // Put Sarah Chen's non-agent email at the top
      const aIsSarahNonAgent = (a.id === '1' || a.from?.includes('sarah.chen')) && !a.isAgentEmail
      const bIsSarahNonAgent = (b.id === '1' || b.from?.includes('sarah.chen')) && !b.isAgentEmail
      
      if (aIsSarahNonAgent && !bIsSarahNonAgent) return -1
      if (!aIsSarahNonAgent && bIsSarahNonAgent) return 1
      
      // Otherwise sort by date (newest first)
      return new Date(b.date) - new Date(a.date)
    })
  }

  // Show processing view if active
  if (showAgentProcessing && processingRFQ) {
    return (
      <AgentProcessing
        rfqId={processingRFQ.rfqId}
        partName={processingRFQ.partName}
        onComplete={() => {
          setShowAgentProcessing(false)
          setProcessingRFQ(null)
          // Navigate to inbox to see the results
          setCurrentFolder('inbox')
        }}
        onSkip={() => {
          setShowAgentProcessing(false)
          setProcessingRFQ(null)
          setCurrentFolder('inbox')
        }}
      />
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header onSearch={handleSearch} />
      <div className="flex-1 flex overflow-hidden">
        <ResizablePane
          defaultWidth={250}
          minWidth={180}
          maxWidth={400}
          storageKey="procureflow-sidebar-width"
        >
          <Sidebar
            folders={folders}
            emails={emails}
            currentFolder={currentFolder}
            onFolderSelect={handleFolderSelect}
          />
        </ResizablePane>
        <div className="flex-1 flex overflow-hidden">
          <ResizablePane
            defaultWidth={400}
            minWidth={300}
            maxWidth={600}
            storageKey="procureflow-emaillist-width"
          >
            <div className="h-full bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {folders.find(f => f.id === currentFolder)?.name || 'Mail'}
                </h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <EmailList
                  emails={filteredEmails}
                  selectedEmailId={selectedEmail?.id}
                  onEmailSelect={handleEmailSelect}
                />
              </div>
            </div>
          </ResizablePane>
          <div className="flex-1 overflow-hidden">
            <ReadingPane
              email={selectedEmail}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onMarkRead={handleMarkRead}
              emails={emails}
              onEmailSelect={handleEmailSelect}
              onCompareQuotes={() => {
                if (selectedEmail?.rfqId) {
                  setShowQuoteComparison(true)
                }
              }}
              onClarificationSubmit={(answers) => {
                // This is handled by ClarificationInterface, but we can add additional logic here if needed
                console.log('Clarification answers submitted:', answers)
              }}
              onSendToAgent={demoState ? (email) => {
                // Step 1: Request Received
                const rfqId = email.rfqId || `RFQ-2024-${String(Date.now()).slice(-4)}`
                const agentEmail = {
                  ...email,
                  isAgentEmail: true,
                  rfqId,
                  folder: 'inbox'
                }
                
                // Set processing step
                demoState.setProcessingStep('request_received')
                demoState.submitRfq(agentEmail)
                
                // Step 2: After 1 second, start parsing requirements
                setTimeout(() => {
                  demoState.setProcessingStep('parsing')
                  demoState.setRequirementsParsing(true)
                  
                  // Step 3: After 2-3 seconds, show requirements review modal
                  setTimeout(() => {
                    demoState.setRequirementsParsing(false)
                    demoState.setProcessingStep('requirements_review')
                    demoState.setRequirementsReviewPending(true)
                    setShowRequirementsReview(true)
                  }, 2500)
                }, 1000)
              } : undefined}
            />
          </div>
        </div>
      </div>
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSend}
      />
      {showQuoteComparison && selectedEmail?.rfqId && (
        <QuoteComparison
          rfqId={selectedEmail.rfqId}
          emails={emails}
          onClose={() => setShowQuoteComparison(false)}
          onSelectSupplier={(supplierId) => {
            if (demoState) {
              // Find the full supplier object from the ID
              const supplier = suppliers.find(s => s.id === supplierId) || { id: supplierId, name: supplierId }
              // Set generating PO state and select supplier
              demoState.setGeneratingPO(true)
              demoState.selectSupplier(supplier)
            }
            setShowQuoteComparison(false)
          }}
        />
      )}

      {/* PO Generator Modal */}
      {demoState && demoState.showPOGenerator && demoState.selectedSupplier && selectedEmail?.rfqId && (
        <POGenerator
          rfqId={selectedEmail.rfqId}
          selectedEmail={selectedEmail}
          selectedSupplier={demoState.selectedSupplier}
          emails={emails}
          onApprove={(poData) => {
            if (demoState) {
              // Find supplier details from suppliers list
              const supplierId = typeof demoState.selectedSupplier === 'object' 
                ? demoState.selectedSupplier.id || demoState.selectedSupplier 
                : demoState.selectedSupplier
              
              const supplier = suppliers.find(s => s.id === supplierId) || 
                               (typeof demoState.selectedSupplier === 'object' ? demoState.selectedSupplier : { id: supplierId, name: supplierId })
              
              // Create and send PO email to supplier
              const poEmail = {
                id: `po-${selectedEmail.rfqId}-${Date.now()}`,
                subject: `PO-${selectedEmail.rfqId.replace('RFQ-', '')}: Purchase Order`,
                from: 'procurement-agent@company.com',
                to: supplier.email || `quotes@${supplier.id || supplier.name?.toLowerCase().replace(/\s+/g, '')}.com`,
                date: new Date().toISOString(),
                body: `Dear ${supplier.name || supplier.id} Team,

Please find attached the Purchase Order for the following:

**PO Number:** PO-${selectedEmail.rfqId.replace('RFQ-', '')}
**Part:** ${selectedEmail.partName || extractPartNameFromEmail(selectedEmail) || 'Part'}
**Quantity:** ${poData.quantity || 150} units
${poData.totalAmount ? `**Unit Price:** $${(poData.unitPrice || 0).toFixed(2)}\n**Tooling:** $${(poData.tooling || 0).toFixed(2)}\n**Total Amount:** $${poData.totalAmount.toFixed(2)}` : '**Total Amount:** Per quote'}
${poData.leadTime ? `**Lead Time:** ${poData.leadTime}` : ''}
${poData.terms ? `**Payment Terms:** ${poData.terms}` : ''}

This PO is issued based on your quote for RFQ-${selectedEmail.rfqId}.

Best regards,
ProcureFlow Agent
Procurement Department`,
                read: false,
                folder: 'sent',
                attachments: [],
                isAgentEmail: true,
                rfqId: selectedEmail.rfqId,
                rfqStatus: 'complete',
                partName: selectedEmail.partName || extractPartNameFromEmail(selectedEmail)
              }
              
              demoState.setEmails(prevEmails => [poEmail, ...prevEmails])
              demoState.generatePO(poData)
            }
          }}
          onClose={() => {
            if (demoState) {
              demoState.setGeneratingPO(false)
              demoState.setShowPOGenerator(false)
              demoState.advanceToStage(STAGES.QUOTES_RECEIVED)
            }
          }}
        />
      )}

      {/* Simulate Replies Button */}
      {shouldShowSimulateButton() && (
        <SimulateRepliesButton
          visible={true}
          onSimulate={() => {
            const rfqId = getCurrentRfqId()
            if (rfqId) {
              simulateReplies(rfqId)
            }
          }}
        />
      )}
      
      {/* Requirements Review Modal */}
      {showRequirementsReview && demoState && selectedEmail && (
        <RequirementsReviewModal
          email={selectedEmail}
          parsedRequirements={demoState.parsedRequirements}
          onAccept={(approvedRequirements) => {
            demoState.approveRequirements(approvedRequirements)
            setShowRequirementsReview(false)
            
            // Step 4: Start market scan
            setTimeout(() => {
              demoState.setMarketScanning(true)
              
              // Step 5: After market scan, show supplier selection
              setTimeout(() => {
                demoState.setMarketScanning(false)
                demoState.setSuppliersFound(suppliers)
                demoState.setProcessingStep('supplier_selection')
                demoState.setSupplierSelectionPending(true)
                setShowSupplierSelection(true)
              }, 3500)
            }, 500)
          }}
          onReject={() => {
            demoState.setRequirementsReviewPending(false)
            demoState.setProcessingStep(null)
            setShowRequirementsReview(false)
          }}
          onClose={() => {
            demoState.setRequirementsReviewPending(false)
            demoState.setProcessingStep(null)
            setShowRequirementsReview(false)
          }}
        />
      )}
      
      {/* Supplier Selection Modal */}
      {showSupplierSelection && demoState && (
        <SupplierSelectionModal
          foundSuppliers={demoState.suppliersFound}
          onSelect={(selectedSuppliers) => {
            demoState.selectSuppliersForRFQ(selectedSuppliers)
            setShowSupplierSelection(false)
            
            // Step 6: Show draft RFQ modal
            setTimeout(() => {
              demoState.setProcessingStep('draft_rfq')
              demoState.setDraftRFQPending(true)
              setShowRFQDraft(true)
            }, 500)
          }}
          onClose={() => {
            demoState.setSupplierSelectionPending(false)
            demoState.setProcessingStep(null)
            setShowSupplierSelection(false)
          }}
        />
      )}
      
      {/* RFQ Draft Modal */}
      {showRFQDraft && demoState && demoState.draftRFQ && (
        <RFQDraftModal
          draftRFQ={demoState.draftRFQ}
          suppliers={demoState.selectedSuppliersForRFQ}
          onApprove={(approvedDraft, suppliers) => {
            const result = demoState.approveDraftRFQ(approvedDraft, suppliers)
            setShowRFQDraft(false)
            
            // Step 7: Generate and send RFQ emails
            const rfqId = approvedDraft.rfqId || demoState.currentRfqId
            const suppliersToSend = suppliers || result.suppliers || demoState.selectedSuppliersForRFQ
            
            // Extract part name from approved draft or original email
            const partName = approvedDraft.partName || extractPartNameFromEmail(selectedEmail)
            
            // Generate email for each supplier
            const rfqEmails = suppliersToSend.map((supplier, index) => {
              const supplierEmail = supplier.email || supplier
              const supplierName = supplier.name || supplierEmail.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
              const threadId = getThreadId(rfqId, supplierEmail)
              
              return {
                id: `rfq-${rfqId}-${supplier.id || index}-${Date.now()}`,
                subject: approvedDraft.subject || `RFQ-${rfqId}: ${approvedDraft.partName} (${approvedDraft.quantity} pcs)`,
                from: 'procurement-agent@company.com',
                to: supplierEmail,
                date: new Date().toISOString(),
                body: approvedDraft.body || '',
                read: true,
                folder: 'sent',
                attachments: selectedEmail?.attachments || [],
                isAgentEmail: true,
                rfqId: rfqId,
                rfqStatus: 'sent',
                partName: partName, // Store part name for folder organization
                supplierName: supplierName, // Store supplier name for display
                supplierEmail: supplierEmail, // Store supplier email for reference
                threadId: threadId, // Thread ID for email chaining
                threadIndex: 0 // Original RFQ is index 0
              }
            })
            
            // Update the original email to be an agent email (so button disappears and panel appears)
            demoState.setEmails(prevEmails => {
              return prevEmails.map(e => {
                if (e.id === selectedEmail?.id) {
                  // Generate threadId for the original email (thread with the sender)
                  const originalThreadId = getThreadId(rfqId, e.from)
                  return {
                    ...e,
                    isAgentEmail: true,
                    rfqId: rfqId,
                    partName: partName, // Store part name for folder organization
                    threadId: originalThreadId, // Thread with original sender
                    threadIndex: 0 // Original request is index 0
                  }
                }
                return e
              })
            })
            
            // Update selected email to be an agent email
            if (selectedEmail) {
              const originalThreadId = getThreadId(rfqId, selectedEmail.from)
              demoState.setSelectedEmail({
                ...selectedEmail,
                isAgentEmail: true,
                rfqId: rfqId,
                partName: partName,
                threadId: originalThreadId,
                threadIndex: 0
              })
            }
            
            // Add RFQ emails to the list
            demoState.setEmails(prevEmails => [...rfqEmails, ...prevEmails])
            
            // Advance to RFQs sent stage
            demoState.advanceToStage(STAGES.RFQS_SENT)
            
            // Show success notification
            console.log(`RFQ sent to ${suppliersToSend.length} suppliers`)
          }}
          onClose={() => {
            demoState.setDraftRFQPending(false)
            demoState.setProcessingStep(null)
            setShowRFQDraft(false)
          }}
        />
      )}
    </div>
  )
}

