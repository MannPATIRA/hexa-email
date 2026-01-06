import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from './Button'
import { suppliers } from '../lib/demoData'

export default function SupplierSelectionModal({ foundSuppliers, onSelect, onClose }) {
  const [selectedSuppliers, setSelectedSuppliers] = useState(
    foundSuppliers ? foundSuppliers.map(s => s.id) : []
  )

  const toggleSupplier = (supplierId) => {
    setSelectedSuppliers(prev => {
      if (prev.includes(supplierId)) {
        return prev.filter(id => id !== supplierId)
      } else {
        return [...prev, supplierId]
      }
    })
  }

  const handleContinue = () => {
    if (selectedSuppliers.length === 0) {
      alert('Please select at least one supplier')
      return
    }
    if (onSelect) {
      const selected = foundSuppliers.filter(s => selectedSuppliers.includes(s.id))
      onSelect(selected)
    }
  }

  const displaySuppliers = foundSuppliers || suppliers

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
        className="bg-outlook-sidebar rounded-lg shadow-2xl border border-outlook-border max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-outlook-border flex items-center justify-between bg-black">
          <div>
            <h2 className="text-xl font-semibold text-white">Select Suppliers</h2>
            <p className="text-sm text-outlook-text-secondary mt-1">
              Found {displaySuppliers.length} verified entities • {selectedSuppliers.length} selected
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white opacity-50 hover:opacity-100 transition-opacity">
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-outlook-bg scrollbar-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displaySuppliers.map((supplier, index) => {
              const isSelected = selectedSuppliers.includes(supplier.id)
              
              return (
                <motion.div
                  key={supplier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => toggleSupplier(supplier.id)}
                  className={`border rounded-md p-5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-outlook-blue bg-outlook-blue/10'
                      : 'border-outlook-border hover:border-outlook-blue/50 bg-outlook-sidebar'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-outlook-blue border-outlook-blue' : 'border-outlook-border bg-black'
                    }`}>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-white truncate">{supplier.name}</h3>
                          <p className="text-xs text-outlook-text-secondary truncate">{supplier.email}</p>
                        </div>
                        {supplier.history?.onTimeRate && (
                          <div className="text-right pl-3">
                            <div className="text-sm font-semibold text-green-400">
                              {(supplier.history.onTimeRate * 100).toFixed(0)}%
                            </div>
                            <div className="text-[10px] font-medium text-outlook-text-tertiary uppercase tracking-wider mt-0.5">Reliability</div>
                          </div>
                        )}
                      </div>

                      {supplier.history && (
                        <div className="mb-4 py-3 border-y border-outlook-border/30 grid grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider">Experience</span>
                            <span className="text-sm font-semibold text-white">{supplier.history.totalOrders || 0} jobs</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-[10px] font-semibold text-outlook-text-tertiary uppercase tracking-wider">Rating</span>
                            <div className="flex items-center justify-end space-x-0.5 text-xs">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < Math.round(supplier.history.averageRating) ? "text-yellow-400" : "text-white/10"}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {supplier.capabilities && supplier.capabilities.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold text-outlook-text-tertiary uppercase tracking-wider mb-2">Capabilities</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {supplier.capabilities.slice(0, 3).map((capability, capIndex) => (
                              <span
                                key={capIndex}
                                className="px-2 py-0.5 bg-outlook-blue/10 border border-outlook-blue/20 text-outlook-blue text-[10px] font-medium rounded"
                              >
                                {capability}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {!supplier.history?.totalOrders && (
                        <div className="mt-3 flex">
                          <span className="px-2 py-0.5 bg-yellow-900/20 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold uppercase tracking-wider rounded">
                            Pre-verified
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="p-6 border-t border-outlook-border flex items-center justify-between bg-black">
          <div className="text-sm text-outlook-text-secondary">
            {selectedSuppliers.length === 0 ? (
              <span className="text-red-400 font-medium">Select at least one supplier</span>
            ) : (
              <span><span className="text-white font-semibold">{selectedSuppliers.length}</span> supplier{selectedSuppliers.length !== 1 ? 's' : ''} selected</span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={onClose} className="text-sm font-semibold text-outlook-text-secondary hover:text-white">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleContinue}
              disabled={selectedSuppliers.length === 0}
              className="text-sm font-semibold px-10 py-2.5"
            >
              Review RFQ Draft
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

