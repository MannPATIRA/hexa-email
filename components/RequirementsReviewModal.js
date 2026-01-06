import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from './Button'

export default function RequirementsReviewModal({ email, parsedRequirements, onAccept, onReject, onClose }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedRequirements, setEditedRequirements] = useState(parsedRequirements || {})

  if (!email) return null

  // Extract requirements from email if not provided
  const extractRequirements = (body) => {
    const requirements = {
      partName: '',
      partNumber: '',
      quantity: '',
      annualVolume: '',
      material: '',
      deliveryDate: '',
      specialRequirements: '',
      itarRequired: false,
      attachments: []
    }

    // Extract part name
    const partNameMatch = body.match(/\*\*Part Name:\*\* (.+?)(?:\n|$)/i) || 
                         body.match(/Part Name: (.+?)(?:\n|$)/i) ||
                         body.match(/Part:\s*(.+?)(?:\n|$)/i)
    if (partNameMatch) requirements.partName = partNameMatch[1].trim()

    // Extract part number
    const partNumberMatch = body.match(/\*\*Part Number:\*\* (.+?)(?:\n|$)/i) ||
                           body.match(/Part Number: (.+?)(?:\n|$)/i)
    if (partNumberMatch) requirements.partNumber = partNumberMatch[1].trim()

    // Extract quantity
    const quantityMatch = body.match(/Initial Quantity: (\d+)/i) ||
                         body.match(/Quantity: (\d+)/i)
    if (quantityMatch) requirements.quantity = quantityMatch[1]

    // Extract annual volume
    const annualVolumeMatch = body.match(/Annual Volume: (\d+)/i)
    if (annualVolumeMatch) requirements.annualVolume = annualVolumeMatch[1]

    // Extract material
    const materialMatch = body.match(/Material: (.+?)(?:\n|$)/i) ||
                         body.match(/\*\*Material:\*\* (.+?)(?:\n|$)/i)
    if (materialMatch) requirements.material = materialMatch[1].trim()

    // Extract delivery date
    const deliveryMatch = body.match(/Delivery Date: (.+?)(?:\n|$)/i) ||
                         body.match(/Delivery: (.+?)(?:\n|$)/i)
    if (deliveryMatch) requirements.deliveryDate = deliveryMatch[1].trim()

    // Extract special requirements
    const specialReqMatch = body.match(/Special Requirement: (.+?)(?:\n|$)/i) ||
                           body.match(/Special Requirements?: (.+?)(?:\n|$)/i)
    if (specialReqMatch) requirements.specialRequirements = specialReqMatch[1].trim()

    // Check for ITAR
    requirements.itarRequired = /itar|domestic|us-based/i.test(body)

    // Get attachments
    if (email.attachments) {
      requirements.attachments = email.attachments
    }

    return requirements
  }

  const requirements = parsedRequirements || extractRequirements(email.body)
  const displayRequirements = isEditing ? editedRequirements : requirements

  const handleFieldChange = (field, value) => {
    setEditedRequirements(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAccept = () => {
    if (onAccept) {
      onAccept(isEditing ? editedRequirements : requirements)
    }
  }

  const handleReject = () => {
    if (onReject) {
      onReject()
    }
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
            <h2 className="text-xl font-semibold text-white">Review Requirements</h2>
            <p className="text-sm text-outlook-text-secondary mt-1">Verify technical parameters before proceeding</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white opacity-50 hover:opacity-100 transition-opacity">
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-outlook-bg scrollbar-custom">
          <div className="space-y-8">
            {/* Part Information */}
            <div>
              <h3 className="text-xs font-bold text-outlook-blue uppercase tracking-wider mb-4">Identification</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Part Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayRequirements.partName || ''}
                      onChange={(e) => handleFieldChange('partName', e.target.value)}
                      className="w-full px-3 py-2 bg-outlook-sidebar border border-outlook-border text-white text-sm rounded focus:ring-1 focus:ring-outlook-blue outline-none transition-all"
                    />
                  ) : (
                    <p className="text-base text-white font-semibold">{displayRequirements.partName || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Part Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayRequirements.partNumber || ''}
                      onChange={(e) => handleFieldChange('partNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-outlook-sidebar border border-outlook-border text-white text-sm rounded focus:ring-1 focus:ring-outlook-blue outline-none transition-all"
                    />
                  ) : (
                    <p className="text-base text-white">{displayRequirements.partNumber || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity & Volume */}
            <div>
              <h3 className="text-xs font-bold text-outlook-blue uppercase tracking-wider mb-4">Volume Parameters</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Initial Quantity</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={displayRequirements.quantity || ''}
                      onChange={(e) => handleFieldChange('quantity', e.target.value)}
                      className="w-full px-3 py-2 bg-outlook-sidebar border border-outlook-border text-white text-sm rounded focus:ring-1 focus:ring-outlook-blue outline-none transition-all"
                    />
                  ) : (
                    <p className="text-base text-white font-semibold">{displayRequirements.quantity || 'N/A'} units</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Annual Forecast</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={displayRequirements.annualVolume || ''}
                      onChange={(e) => handleFieldChange('annualVolume', e.target.value)}
                      className="w-full px-3 py-2 bg-outlook-sidebar border border-outlook-border text-white text-sm rounded focus:ring-1 focus:ring-outlook-blue outline-none transition-all"
                    />
                  ) : (
                    <p className="text-base text-white font-semibold">{displayRequirements.annualVolume || 'N/A'} units/year</p>
                  )}
                </div>
              </div>
            </div>

            {/* Material & Delivery */}
            <div>
              <h3 className="text-xs font-bold text-outlook-blue uppercase tracking-wider mb-4">Technical Specs</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Material</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayRequirements.material || ''}
                      onChange={(e) => handleFieldChange('material', e.target.value)}
                      className="w-full px-3 py-2 bg-outlook-sidebar border border-outlook-border text-white text-sm rounded focus:ring-1 focus:ring-outlook-blue outline-none transition-all"
                    />
                  ) : (
                    <p className="text-base text-white">{displayRequirements.material || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Delivery Date</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayRequirements.deliveryDate || ''}
                      onChange={(e) => handleFieldChange('deliveryDate', e.target.value)}
                      className="w-full px-3 py-2 bg-outlook-sidebar border border-outlook-border text-white text-sm rounded focus:ring-1 focus:ring-outlook-blue outline-none transition-all"
                    />
                  ) : (
                    <p className="text-base text-white">{displayRequirements.deliveryDate || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            {(displayRequirements.specialRequirements || isEditing) && (
              <div>
                <h3 className="text-xs font-bold text-outlook-blue uppercase tracking-wider mb-4">Special Instructions</h3>
                {isEditing ? (
                  <textarea
                    value={displayRequirements.specialRequirements || ''}
                    onChange={(e) => handleFieldChange('specialRequirements', e.target.value)}
                    className="w-full px-3 py-2 bg-outlook-sidebar border border-outlook-border text-white text-sm rounded focus:ring-1 focus:ring-outlook-blue outline-none transition-all min-h-[100px]"
                    placeholder="Enter any special constraints..."
                  />
                ) : (
                  <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-md p-5">
                    <p className="text-sm text-outlook-text-secondary leading-relaxed italic">"{displayRequirements.specialRequirements}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Compliance */}
            {displayRequirements.itarRequired && (
              <div>
                <h3 className="text-xs font-bold text-outlook-blue uppercase tracking-wider mb-4">Regulatory Compliance</h3>
                <div className="bg-outlook-sidebar border border-outlook-border rounded-md p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="px-2 py-0.5 bg-outlook-blue/10 border border-outlook-blue/20 rounded">
                      <span className="text-[10px] font-bold text-outlook-blue">ITAR</span>
                    </div>
                    <span className="text-sm text-outlook-text-secondary font-medium">Domestic restricted manufacturing</span>
                  </div>
                  {isEditing && (
                    <input
                      type="checkbox"
                      checked={displayRequirements.itarRequired}
                      onChange={(e) => handleFieldChange('itarRequired', e.target.checked)}
                      className="w-4 h-4 text-outlook-blue bg-black border-outlook-border rounded"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-outlook-border flex items-center justify-between bg-black">
          <div className="flex space-x-3">
            {!isEditing ? (
              <Button variant="secondary" onClick={() => setIsEditing(true)} className="text-sm font-semibold">
                Edit Details
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => { setIsEditing(false); setEditedRequirements(requirements); }} className="text-sm font-semibold text-outlook-text-secondary">
                Cancel
              </Button>
            )}
            <Button variant="ghost" onClick={handleReject} className="text-sm font-semibold text-red-400 hover:text-red-300">
              Reject RFQ
            </Button>
          </div>
          <Button variant="primary" onClick={handleAccept} className="text-sm font-semibold px-10 py-2.5">
            {isEditing ? 'Save & Proceed' : 'Accept & Find Suppliers'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

