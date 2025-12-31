import { motion } from 'framer-motion'
import Button from './Button'

export default function RequirementsViewer({ email, onClose }) {
  if (!email) return null

  // Extract requirements from email body
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

    return requirements
  }

  const requirements = extractRequirements(email.body)

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
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Requirements</h2>
            <p className="text-sm text-gray-500 mt-1">RFQ: {email.rfqId || 'N/A'}</p>
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
                  <p className="text-base text-gray-900 mt-1">{requirements.partName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Part Number</label>
                  <p className="text-base text-gray-900 mt-1">{requirements.partNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Quantity & Volume */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Initial Quantity</label>
                  <p className="text-base text-gray-900 mt-1">{requirements.quantity || 'N/A'} units</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Annual Volume</label>
                  <p className="text-base text-gray-900 mt-1">{requirements.annualVolume || 'N/A'} units/year</p>
                </div>
              </div>
            </div>

            {/* Material & Delivery */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Material</label>
                  <p className="text-base text-gray-900 mt-1">{requirements.material || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Delivery Date</label>
                  <p className="text-base text-gray-900 mt-1">{requirements.deliveryDate || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            {requirements.specialRequirements && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requirements</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-base text-gray-900">{requirements.specialRequirements}</p>
                </div>
              </div>
            )}

            {/* Compliance */}
            {requirements.itarRequired && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 font-semibold">ITAR</span>
                    <span className="text-sm text-gray-700">Domestic suppliers only (US-based manufacturing required)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Attachments */}
            {email.attachments && email.attachments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
                <div className="space-y-2">
                  {email.attachments.map((attachment, index) => {
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

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

