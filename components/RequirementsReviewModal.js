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
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Parsed Requirements</h2>
            <p className="text-sm text-gray-500 mt-1">Please review the extracted requirements from the email</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Part Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Part Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Part Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayRequirements.partName || ''}
                      onChange={(e) => handleFieldChange('partName', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-base text-gray-900 mt-1">{displayRequirements.partName || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Part Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayRequirements.partNumber || ''}
                      onChange={(e) => handleFieldChange('partNumber', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-base text-gray-900 mt-1">{displayRequirements.partNumber || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity & Volume */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Initial Quantity</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={displayRequirements.quantity || ''}
                      onChange={(e) => handleFieldChange('quantity', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-base text-gray-900 mt-1">{displayRequirements.quantity || 'N/A'} units</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Annual Volume</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={displayRequirements.annualVolume || ''}
                      onChange={(e) => handleFieldChange('annualVolume', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-base text-gray-900 mt-1">{displayRequirements.annualVolume || 'N/A'} units/year</p>
                  )}
                </div>
              </div>
            </div>

            {/* Material & Delivery */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Material</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayRequirements.material || ''}
                      onChange={(e) => handleFieldChange('material', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-base text-gray-900 mt-1">{displayRequirements.material || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Delivery Date</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayRequirements.deliveryDate || ''}
                      onChange={(e) => handleFieldChange('deliveryDate', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-base text-gray-900 mt-1">{displayRequirements.deliveryDate || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            {displayRequirements.specialRequirements && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requirements</h3>
                {isEditing ? (
                  <textarea
                    value={displayRequirements.specialRequirements || ''}
                    onChange={(e) => handleFieldChange('specialRequirements', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-base text-gray-900">{displayRequirements.specialRequirements}</p>
                  </div>
                )}
              </div>
            )}

            {/* Compliance */}
            {displayRequirements.itarRequired && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={displayRequirements.itarRequired}
                      onChange={(e) => handleFieldChange('itarRequired', e.target.checked)}
                      disabled={!isEditing}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-blue-600 font-semibold">ITAR</span>
                    <span className="text-sm text-gray-700">Domestic suppliers only (US-based manufacturing required)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Attachments */}
            {displayRequirements.attachments && displayRequirements.attachments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
                <div className="space-y-2">
                  {displayRequirements.attachments.map((attachment, index) => {
                    const name = typeof attachment === 'string' ? attachment : attachment.name
                    const type = typeof attachment === 'object' ? attachment.type : null
                    return (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{name}</p>
                          {type && <p className="text-xs text-gray-500">{type}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex space-x-3">
            {!isEditing && (
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
              >
                Edit Requirements
              </Button>
            )}
            {isEditing && (
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false)
                  setEditedRequirements(requirements)
                }}
              >
                Cancel Edit
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleReject}
              className="text-red-600 hover:text-red-700"
            >
              Reject
            </Button>
          </div>
          <Button
            variant="primary"
            onClick={handleAccept}
          >
            {isEditing ? 'Save & Accept' : 'Accept Requirements'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

