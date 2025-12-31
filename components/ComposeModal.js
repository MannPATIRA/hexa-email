import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

const PROCUREMENT_AGENT_EMAIL = 'procurement-agent@company.com'

export default function ComposeModal({ isOpen, onClose, onSend }) {
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState([])

  const isRFQMode = useMemo(() => {
    return to.toLowerCase().includes(PROCUREMENT_AGENT_EMAIL.toLowerCase())
  }, [to])

  // Auto-prefix subject for RFQ
  useEffect(() => {
    if (isRFQMode && subject && !subject.startsWith('RFQ Request -')) {
      // Only auto-prefix if user hasn't already typed it
      if (!subject.toLowerCase().includes('rfq')) {
        // Don't auto-prefix, let user type naturally
      }
    }
  }, [isRFQMode, subject])

  // RFQ checklist items
  const checklistItems = useMemo(() => {
    if (!isRFQMode) return []
    
    const bodyLower = body.toLowerCase()
    const checks = {
      partName: bodyLower.match(/(part|component|item).*?(name|number|#)/i) !== null,
      quantity: bodyLower.match(/\d+\s*(units?|pcs?|pieces?|quantity)/i) !== null,
      material: bodyLower.match(/(material|alloy|grade|6061|aluminum|steel|plastic)/i) !== null,
      deliveryDate: bodyLower.match(/(delivery|due|date|weeks?|days?|deadline)/i) !== null,
      requirements: bodyLower.match(/(requirement|spec|specification|test|compliance|itar)/i) !== null
    }
    
    return [
      { id: 'partName', label: 'Part name/number', checked: checks.partName },
      { id: 'quantity', label: 'Quantity', checked: checks.quantity },
      { id: 'material', label: 'Material', checked: checks.material },
      { id: 'deliveryDate', label: 'Delivery date', checked: checks.deliveryDate },
      { id: 'requirements', label: 'Special requirements', checked: checks.requirements }
    ]
  }, [isRFQMode, body])

  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files || [])
    const newAttachments = files.map(file => ({
      name: file.name,
      type: getFileType(file.name),
      size: file.size
    }))
    setAttachments([...attachments, ...newAttachments])
  }

  const handleFileRemove = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const getFileType = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (['pdf'].includes(ext)) return 'drawing'
    if (['step', 'stp', 'iges', 'igs'].includes(ext)) return 'cad'
    if (['xlsx', 'xls', 'doc', 'docx'].includes(ext)) return 'spec'
    return 'other'
  }

  const handleSend = () => {
    if (to && subject && body) {
      const newEmail = {
        id: Date.now().toString(),
        subject: isRFQMode && !subject.startsWith('RFQ Request -') 
          ? `RFQ Request - ${subject}` 
          : subject,
        from: 'user@example.com',
        to,
        cc: cc || undefined,
        date: new Date().toISOString(),
        body,
        read: true,
        folder: 'sent',
        attachments: attachments.map(a => ({ name: a.name, type: a.type })),
        ...(isRFQMode && {
          isAgentEmail: true,
          rfqId: `RFQ-2024-${String(Date.now()).slice(-4)}`
        })
      }
      onSend(newEmail)
      setTo('')
      setCc('')
      setSubject('')
      setBody('')
      setAttachments([])
      onClose()
    }
  }

  const handleClose = () => {
    setTo('')
    setCc('')
    setSubject('')
    setBody('')
    setAttachments([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`bg-white rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col transition-all duration-300 ${
            isRFQMode ? 'max-w-6xl' : 'max-w-2xl'
          }`}
        >
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">New Message</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden flex">
            {/* Main compose area */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${isRFQMode ? 'border-r border-gray-200' : ''}`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Recipient email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cc</label>
                <input
                  type="email"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cc (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={isRFQMode ? "RFQ Request - Part Name - Project Name" : "Email subject"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={isRFQMode ? 16 : 12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder={isRFQMode ? "Describe your part requirements, quantity, material, delivery date, and any special requirements..." : "Type your message here..."}
                />
              </div>
            </div>

            {/* RFQ Assistant Sidebar */}
            {isRFQMode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-80 bg-gray-50 overflow-y-auto p-6 scrollbar-custom"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <h3 className="font-semibold text-gray-900">RFQ Assistant</h3>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-700 mb-3">Help me gather the info suppliers need:</p>
                  <div className="space-y-2">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        {item.checked ? (
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0"></div>
                        )}
                        <span className={`text-sm ${item.checked ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Attachments (drag or click):</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>2D Drawing (.pdf)</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>3D Model (.step, .iges)</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Specifications (.pdf)</span>
                      </div>
                    </div>
                    <label className="block">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileAdd}
                        className="hidden"
                        accept=".pdf,.step,.stp,.iges,.igs,.xlsx,.xls,.doc,.docx"
                        aria-label="Add attachment files"
                      />
                      <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                        + Add files
                      </span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Attachments display */}
          {attachments.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm"
                  >
                    <span className="text-gray-500">
                      {attachment.type === 'drawing' ? 'PDF' :
                       attachment.type === 'cad' ? 'CAD' :
                       attachment.type === 'spec' ? 'SPEC' : 'FILE'}
                    </span>
                    <span className="text-gray-700">{attachment.name}</span>
                    <button
                      onClick={() => handleFileRemove(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSend}>
              {isRFQMode ? (
                <>
                  Hexa →
                </>
              ) : (
                'Send'
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

