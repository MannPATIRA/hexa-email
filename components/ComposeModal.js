import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

export default function ComposeModal({ isOpen, onClose, onSend }) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const handleSend = () => {
    if (to && subject && body) {
      const newEmail = {
        id: Date.now().toString(),
        subject,
        from: 'user@example.com',
        to,
        date: new Date().toISOString(),
        body,
        read: true,
        folder: 'sent',
        attachments: []
      }
      onSend(newEmail)
      setTo('')
      setSubject('')
      setBody('')
      onClose()
    }
  }

  const handleClose = () => {
    setTo('')
    setSubject('')
    setBody('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Type your message here..."
              />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSend}>
              Send
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

