import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'
import { useDemoState } from '../lib/demoState'

export default function POGenerator({ rfqId, selectedEmail, selectedSupplier, onApprove, onClose }) {
  const [isApproving, setIsApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [isGenerating, setIsGenerating] = useState(true)
  
  let demoState = null
  try {
    demoState = useDemoState()
  } catch (e) {
    // Not in demo mode
  }

  // Show generating state for 2 seconds, then show preview
  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => {
        setIsGenerating(false)
        if (demoState) {
          demoState.setGeneratingPO(false)
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isGenerating, demoState])

  if (!rfqId || !selectedSupplier) {
    return null
  }
  
  // Show generating state
  if (isGenerating || demoState?.generatingPO) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-outlook-sidebar rounded-lg shadow-2xl border border-outlook-border max-w-md w-full p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-outlook-blue border-t-transparent rounded-full mx-auto mb-6"
          />
          <h2 className="text-xl font-semibold text-white mb-2">Generating Order</h2>
          <p className="text-sm text-outlook-text-secondary">
            Compiling purchase order for <span className="text-outlook-blue font-semibold">{typeof selectedSupplier === 'object' ? selectedSupplier.name : selectedSupplier}</span>
          </p>
        </motion.div>
      </motion.div>
    )
  }

  // Extract supplier info
  const supplier = typeof selectedSupplier === 'string' 
    ? { id: selectedSupplier, name: selectedSupplier }
    : selectedSupplier

  // Extract RFQ details from email
  const partNameMatch = selectedEmail?.subject?.match(/- (.+?) -/) || 
                       selectedEmail?.body?.match(/\*\*Part Name:\*\* (.+?)\n/)
  const partName = partNameMatch ? partNameMatch[1] : 'Part'
  
  const quantityMatch = selectedEmail?.body?.match(/Initial Quantity: (\d+)/)
  const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 150

  const handleApprove = async () => {
    setIsApproving(true)
    // Simulate approval delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsApproved(true)
    setIsApproving(false)
    
    if (onApprove) {
      onApprove({
        rfqId,
        supplierId: supplier.id,
        supplierName: supplier.name,
        partName,
        quantity,
        date: new Date().toISOString()
      })
    }
  }

  if (isApproved) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-outlook-sidebar rounded-lg shadow-2xl border border-outlook-border max-w-2xl w-full p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-semibold text-white mb-2">Purchase Order Sent</h2>
          <p className="text-outlook-text-secondary mb-8">
            PO confirmed and transmitted to <span className="text-white font-semibold">{supplier.name}</span>
          </p>
          <Button variant="primary" onClick={onClose} className="px-10 py-2 text-sm font-semibold">
            Return to Inbox
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-outlook-sidebar rounded-lg shadow-2xl border border-outlook-border max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-outlook-border flex items-center justify-between bg-black">
          <div>
            <h2 className="text-xl font-semibold text-white">Purchase Order</h2>
            <p className="text-sm text-outlook-text-secondary mt-1">Ref: {rfqId}</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white opacity-50 hover:opacity-100 transition-opacity">
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-outlook-bg scrollbar-custom">
          <div className="space-y-8">
            {/* PO Details */}
            <div>
              <h3 className="text-[11px] font-semibold text-outlook-blue uppercase tracking-wide mb-3">Core Specifications</h3>
              <div className="bg-outlook-sidebar rounded p-6 border border-outlook-border">
                <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                  <div>
                    <label className="text-[10px] font-medium text-outlook-text-secondary uppercase">Document Number</label>
                    <p className="text-sm text-white mt-0.5 font-semibold">PO-{rfqId.replace('RFQ-', '')}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-outlook-text-secondary uppercase">Issue Date</label>
                    <p className="text-sm text-white mt-0.5 font-medium">
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-outlook-text-secondary uppercase">Vendor Entity</label>
                    <p className="text-sm text-white mt-0.5 font-semibold">{supplier.name}</p>
                  </div>
                  <div>
                    <label className="text-[10| font-medium text-outlook-text-secondary uppercase">Part Classification</label>
                    <p className="text-sm text-white mt-0.5 font-medium">{partName}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-outlook-text-secondary uppercase">Procurement Quantity</label>
                    <p className="text-sm text-white mt-0.5 font-semibold">{quantity} units</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-outlook-text-secondary uppercase">Workflow Status</label>
                    <p className="text-sm text-amber-400 mt-0.5 font-semibold">Pending Approval</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div>
              <h3 className="text-[11px] font-semibold text-outlook-blue uppercase tracking-wide mb-3">Commercial Terms</h3>
              <div className="border border-outlook-border rounded p-6 bg-outlook-sidebar">
                <ul className="space-y-2.5 text-[13px] text-outlook-text-secondary">
                  <li className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-outlook-blue mt-1.5 flex-shrink-0"></div>
                    <span>Net 30 payment schedule from receipt of verified invoice.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-outlook-blue mt-1.5 flex-shrink-0"></div>
                    <span>FOB Destination delivery per primary RFQ constraints.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-outlook-blue mt-1.5 flex-shrink-0"></div>
                    <span>Quality assurance per ISO 9001 and internal engineering specs.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-outlook-blue mt-1.5 flex-shrink-0"></div>
                    <span>Standard manufacturing warranty applies to all delivered units.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* PO Preview */}
            <div>
              <h3 className="text-[11px] font-semibold text-outlook-blue uppercase tracking-wide mb-3">Official Document Preview</h3>
              <div className="border border-outlook-border rounded p-8 bg-black/20 text-[13px] relative overflow-hidden">
                <div className="space-y-3 max-w-lg mx-auto">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-outlook-text-secondary font-medium">PO IDENTIFIER:</span>
                    <span className="font-semibold text-white">PO-{rfqId.replace('RFQ-', '')}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-outlook-text-secondary font-medium">VENDOR:</span>
                    <span className="font-semibold text-white uppercase">{supplier.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-outlook-text-secondary font-medium">LINE ITEM:</span>
                    <span className="font-semibold text-white">{partName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-outlook-text-secondary font-medium">QTY:</span>
                    <span className="font-semibold text-white">{quantity} PCS</span>
                  </div>
                  <div className="pt-4 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">TOTAL PAYABLE:</span>
                    <span className="text-base font-bold text-outlook-blue">AS PER QUOTATION</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-outlook-border flex items-center justify-between bg-black">
          <Button variant="ghost" onClick={onClose} className="text-[11px] font-semibold text-outlook-text-secondary hover:text-white uppercase tracking-wide">
            Discard
          </Button>
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={isApproving}
            className="text-[11px] font-bold px-10 py-2.5 uppercase tracking-wide"
          >
            {isApproving ? 'Transmitting...' : 'Authorize & Send PO'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

