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
        className="bg-outlook-sidebar rounded-lg shadow-2xl border border-outlook-border max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-outlook-border flex items-center justify-between bg-black">
          <div>
            <h2 className="text-xl font-semibold text-white">Project Requirements</h2>
            <p className="text-sm text-outlook-text-secondary mt-1 tracking-tight">Technical specifications and constraints</p>
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
                <div className="bg-outlook-sidebar p-4 rounded-md border border-outlook-border shadow-inner">
                  <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Part Designation</label>
                  <p className="text-base text-white font-semibold">{requirements.partName || 'N/A'}</p>
                </div>
                <div className="bg-outlook-sidebar p-4 rounded-md border border-outlook-border shadow-inner">
                  <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Serial/Part Number</label>
                  <p className="text-base text-white">{requirements.partNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Quantity & Volume */}
            <div>
              <h3 className="text-xs font-bold text-outlook-blue uppercase tracking-wider mb-4">Volume Parameters</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-outlook-sidebar p-4 rounded-md border border-outlook-border shadow-inner">
                  <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Initial Batch</label>
                  <p className="text-base text-white font-semibold">{requirements.quantity || 'N/A'} units</p>
                </div>
                <div className="bg-outlook-sidebar p-4 rounded-md border border-outlook-border shadow-inner">
                  <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Annual Forecast</label>
                  <p className="text-base text-white font-semibold">{requirements.annualVolume || 'N/A'} units/year</p>
                </div>
              </div>
            </div>

            {/* Material & Delivery */}
            <div>
              <h3 className="text-xs font-bold text-outlook-blue uppercase tracking-wider mb-4">Technical Specs</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-outlook-sidebar p-4 rounded-md border border-outlook-border shadow-inner">
                  <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Material Standard</label>
                  <p className="text-base text-white">{requirements.material || 'N/A'}</p>
                </div>
                <div className="bg-outlook-sidebar p-4 rounded-md border border-outlook-border shadow-inner">
                  <label className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider block mb-1">Deadline Date</label>
                  <p className="text-base text-white">{requirements.deliveryDate || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            {requirements.specialRequirements && (
              <div>
                <h3 className="text-xs font-bold text-outlook-blue uppercase tracking-wider mb-4">Special Instructions</h3>
                <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-md p-5">
                  <p className="text-sm text-outlook-text-secondary leading-relaxed italic">"{requirements.specialRequirements}"</p>
                </div>
              </div>
            )}

            {/* Compliance */}
            {requirements.itarRequired && (
              <div>
                <h3 className="text-xs font-bold text-outlook-blue uppercase tracking-wider mb-4">Regulatory Compliance</h3>
                <div className="bg-outlook-sidebar border border-outlook-border rounded-md p-5">
                  <div className="flex items-center space-x-3">
                    <div className="px-2 py-0.5 bg-outlook-blue/10 border border-outlook-blue/20 rounded">
                      <span className="text-[10px] font-bold text-outlook-blue">ITAR</span>
                    </div>
                    <span className="text-sm text-outlook-text-secondary font-medium">Domestic suppliers only (US-based manufacturing required)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Attachments */}
            {email.attachments && email.attachments.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-outlook-blue uppercase tracking-wider mb-4">Technical Data Package</h3>
                <div className="space-y-2">
                  {email.attachments.map((attachment, index) => {
                    const name = typeof attachment === 'string' ? attachment : attachment.name
                    const type = typeof attachment === 'object' ? attachment.type : null
                    return (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-outlook-sidebar border border-outlook-border rounded-md hover:border-outlook-blue/50 transition-colors group cursor-pointer">
                        <div className="w-10 h-10 rounded bg-black/40 flex items-center justify-center flex-shrink-0 group-hover:bg-outlook-blue/10 transition-colors">
                          <svg className="w-5 h-5 text-outlook-text-tertiary group-hover:text-outlook-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{name}</p>
                          {type && <p className="text-[10px] text-outlook-text-tertiary font-medium uppercase tracking-wider">{type}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-outlook-border flex justify-end bg-black">
          <Button variant="primary" onClick={onClose} className="text-sm font-semibold px-10 py-2">
            Close Viewer
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

