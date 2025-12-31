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
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Purchase Order...</h2>
          <p className="text-gray-600">
            Creating PO for {typeof selectedSupplier === 'object' ? selectedSupplier.name : selectedSupplier}
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
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Order Sent!</h2>
          <p className="text-gray-600 mb-6">
            PO has been sent to {supplier.name} for {partName}
          </p>
          <Button variant="primary" onClick={onClose}>
            Close
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Purchase Order Draft</h2>
            <p className="text-sm text-gray-500 mt-1">RFQ: {rfqId}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* PO Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PO Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">PO Number</label>
                    <p className="text-base text-gray-900 mt-1 font-mono">PO-{rfqId.replace('RFQ-', '')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-base text-gray-900 mt-1">
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Supplier</label>
                    <p className="text-base text-gray-900 mt-1">{supplier.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Part Name</label>
                    <p className="text-base text-gray-900 mt-1">{partName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Quantity</label>
                    <p className="text-base text-gray-900 mt-1">{quantity} units</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-base text-gray-900 mt-1">Draft</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Payment terms: Net 30</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Delivery: Per RFQ requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Quality: Per engineering specifications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Warranty: Standard supplier warranty applies</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* PO Preview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PO Preview</h3>
              <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50 font-mono text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>PO Number:</span>
                    <span className="font-semibold">PO-{rfqId.replace('RFQ-', '')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supplier:</span>
                    <span>{supplier.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Part:</span>
                    <span>{partName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{quantity} units</span>
                  </div>
                  <div className="border-t border-gray-400 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>Per quote</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={isApproving}
          >
            {isApproving ? 'Sending...' : '✓ Approve & Send PO'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

