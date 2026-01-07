import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from './Button'
import { suppliers } from '../lib/demoData'

export default function RFQDraftModal({ draftRFQ, suppliers: selectedSuppliers, onApprove, onEdit, onClose }) {
  if (!draftRFQ) return null

  const [isApproving, setIsApproving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedDraft, setEditedDraft] = useState(draftRFQ)

  useEffect(() => {
    if (draftRFQ) {
      setEditedDraft(draftRFQ)
    }
  }, [draftRFQ])

  const handleApprove = async () => {
    setIsApproving(true)
    // Simulate approval delay
    await new Promise(resolve => setTimeout(resolve, 500))
    if (onApprove) {
      // Pass the edited draft if editing, otherwise pass original
      onApprove(isEditing ? editedDraft : draftRFQ, selectedSuppliers)
    }
    setIsApproving(false)
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
        className="bg-outlook-sidebar rounded-lg shadow-2xl border border-outlook-border max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-outlook-border flex items-center justify-between bg-black">
          <div>
            <h2 className="text-xl font-semibold text-white">Review RFQ Draft</h2>
            <p className="text-sm text-outlook-text-secondary mt-1">Ready to transmit to {selectedSuppliers?.length || 0} entities</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white opacity-50 hover:opacity-100 transition-opacity">
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-outlook-bg scrollbar-custom">
          <div className="space-y-8">
            {/* RFQ Details */}
            <div>
              <h3 className="text-xs font-bold text-outlook-blue uppercase tracking-wider mb-4">Transmission Details</h3>
              <div className="bg-outlook-sidebar rounded-md p-6 border border-outlook-border shadow-inner">
                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Part Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedDraft?.partName || ''}
                        onChange={(e) => setEditedDraft({ ...editedDraft, partName: e.target.value })}
                        className="w-full px-3 py-1.5 bg-black border border-outlook-border text-white text-sm rounded outline-none focus:ring-1 focus:ring-outlook-blue transition-all"
                      />
                    ) : (
                      <p className="text-base text-white font-semibold">{draftRFQ.partName || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Quantity</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedDraft?.quantity || ''}
                        onChange={(e) => setEditedDraft({ ...editedDraft, quantity: e.target.value })}
                        className="w-full px-3 py-1.5 bg-black border border-outlook-border text-white text-sm rounded outline-none focus:ring-1 focus:ring-outlook-blue transition-all"
                      />
                    ) : (
                      <p className="text-base text-white font-semibold">{draftRFQ.quantity || 'N/A'} units</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Suppliers */}
            {selectedSuppliers && selectedSuppliers.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-outlook-blue uppercase tracking-wider mb-4">Recipient Entities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSuppliers.map((supplier) => (
                    <div key={supplier.id || supplier.email} className="px-3 py-1.5 bg-outlook-sidebar border border-outlook-border rounded-md flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-outlook-blue"></div>
                      <span className="text-xs font-semibold text-white">{supplier.name || supplier.email}</span>
                        </div>
                  ))}
                </div>
              </div>
            )}

            {/* Draft Email Preview/Editor */}
            <div>
              <h3 className="text-xs font-bold text-outlook-blue uppercase tracking-wider mb-4">Email Communication</h3>
              <div className="border border-outlook-border rounded-md p-6 bg-outlook-sidebar shadow-inner">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-xs font-semibold text-outlook-text-tertiary w-16 uppercase tracking-wider">To</span>
                    <p className="text-sm font-semibold text-outlook-blue truncate">
                      {selectedSuppliers?.map(s => s.email || s).join(', ')}
                  </p>
                </div>
                  <div className="flex items-center">
                    <span className="text-xs font-semibold text-outlook-text-tertiary w-16 uppercase tracking-wider">Subject</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedDraft?.subject || `RFQ-${draftRFQ.rfqId}: ${draftRFQ.partName}`}
                      onChange={(e) => setEditedDraft({ ...editedDraft, subject: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-black border border-outlook-border text-white text-sm rounded outline-none focus:ring-1 focus:ring-outlook-blue transition-all"
                    />
                  ) : (
                      <p className="text-sm font-semibold text-white">
                      {draftRFQ.subject || `RFQ-${draftRFQ.rfqId}: ${draftRFQ.partName}`}
                    </p>
                  )}
                </div>
                  <div className="pt-4 border-t border-outlook-border/30">
                  {isEditing ? (
                    <textarea
                        value={editedDraft?.body || draftRFQ.body || ''}
                      onChange={(e) => setEditedDraft({ ...editedDraft, body: e.target.value })}
                        className="w-full px-4 py-3 bg-black border border-outlook-border text-white text-sm rounded outline-none focus:ring-1 focus:ring-outlook-blue transition-all min-h-[300px]"
                    />
                  ) : (
                      <div className="text-sm text-outlook-text-secondary whitespace-pre-wrap leading-relaxed">
                        {draftRFQ.body}
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-outlook-border flex items-center justify-between bg-black">
          <div className="flex space-x-3">
            {!isEditing ? (
              <Button variant="secondary" onClick={() => setIsEditing(true)} className="text-sm font-semibold">
                Edit Draft
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => { setIsEditing(false); setEditedDraft(draftRFQ); }} className="text-sm font-semibold text-outlook-text-secondary">
                Cancel
              </Button>
            )}
          </div>
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={isApproving}
            className="text-sm font-semibold px-10 py-2.5"
          >
            {isApproving ? 'Transmitting...' : 'Approve & Send RFQ'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

