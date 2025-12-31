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
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Draft RFQ Review</h2>
            <p className="text-sm text-gray-500 mt-1">RFQ: {draftRFQ.rfqId || 'N/A'}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* RFQ Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">RFQ Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Part Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedDraft?.partName || ''}
                        onChange={(e) => setEditedDraft({ ...editedDraft, partName: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-base text-gray-900 mt-1">{draftRFQ.partName || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Quantity</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedDraft?.quantity || ''}
                        onChange={(e) => setEditedDraft({ ...editedDraft, quantity: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-base text-gray-900 mt-1">{draftRFQ.quantity || 'N/A'} units</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Material</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedDraft?.material || ''}
                        onChange={(e) => setEditedDraft({ ...editedDraft, material: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-base text-gray-900 mt-1">{draftRFQ.material || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Delivery Date</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedDraft?.deliveryDate || ''}
                        onChange={(e) => setEditedDraft({ ...editedDraft, deliveryDate: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-base text-gray-900 mt-1">{draftRFQ.deliveryDate || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Suppliers */}
            {selectedSuppliers && selectedSuppliers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Suppliers ({selectedSuppliers.length})
                </h3>
                <div className="space-y-2">
                  {selectedSuppliers.map((supplier, index) => {
                    const supplierId = supplier.id || supplier.email
                    return (
                      <div
                        key={supplierId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{supplier.name || supplier.email}</p>
                          {supplier.history && (
                            <p className="text-sm text-gray-500">
                              {supplier.history.totalOrders || 0} orders, {(supplier.history.onTimeRate * 100).toFixed(0)}% on-time
                            </p>
                          )}
                        </div>
                        {isEditing ? (
                          <button
                            onClick={() => {
                              const updated = selectedSuppliers.filter((_, i) => i !== index)
                              // Update suppliers in edited draft if needed
                            }}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="text-sm text-blue-600">Selected</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Draft Email Preview/Editor */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Content</h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-1 block">To:</label>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSuppliers?.map(s => s.email || s).join(', ') || 'Suppliers'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-1 block">Subject:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedDraft?.subject || `RFQ-${draftRFQ.rfqId}: ${draftRFQ.partName}`}
                      onChange={(e) => setEditedDraft({ ...editedDraft, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      {draftRFQ.subject || `RFQ-${draftRFQ.rfqId}: ${draftRFQ.partName}`}
                    </p>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Body:</label>
                  {isEditing ? (
                    <textarea
                      value={editedDraft?.body || draftRFQ.body || 'RFQ content will be generated...'}
                      onChange={(e) => setEditedDraft({ ...editedDraft, body: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={10}
                    />
                  ) : (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {draftRFQ.body || 'RFQ content will be generated...'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex space-x-3">
            {!isEditing && (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit Draft
              </Button>
            )}
            {isEditing && (
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false)
                  setEditedDraft(draftRFQ)
                }}
              >
                Cancel Edit
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              if (isEditing) {
                // Save edits and then approve
                handleApprove()
              } else {
                handleApprove()
              }
            }}
            disabled={isApproving}
          >
            {isApproving ? 'Sending...' : isEditing ? 'Save & Send to All Suppliers' : 'Approve & Send to All Suppliers'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

