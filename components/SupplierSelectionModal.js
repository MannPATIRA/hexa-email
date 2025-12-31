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
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-green-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Suppliers</h2>
            <p className="text-sm text-gray-500 mt-1">
              Found {displaySuppliers.length} suppliers • Select {selectedSuppliers.length}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displaySuppliers.map((supplier, index) => {
              const isSelected = selectedSuppliers.includes(supplier.id)
              
              return (
                <motion.div
                  key={supplier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => toggleSupplier(supplier.id)}
                  className={`border-2 rounded-lg p-5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSupplier(supplier.id)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                          <p className="text-sm text-gray-500">{supplier.email}</p>
                        </div>
                        {supplier.history?.onTimeRate && (
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-600">
                              {(supplier.history.onTimeRate * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">On-time</div>
                          </div>
                        )}
                      </div>

                      {supplier.history && (
                        <div className="mb-3 space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Orders:</span>
                            <span className="font-medium text-gray-900">{supplier.history.totalOrders || 0}</span>
                          </div>
                          {supplier.history.onTimeRate && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">On-Time Rate:</span>
                              <span className="font-medium text-gray-900">{(supplier.history.onTimeRate * 100).toFixed(0)}%</span>
                            </div>
                          )}
                          {supplier.history.averageRating && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Rating:</span>
                              <span className="font-medium text-gray-900">
                                {supplier.history.averageRating.toFixed(1)} ⭐
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {supplier.capabilities && supplier.capabilities.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Capabilities:</h4>
                          <div className="flex flex-wrap gap-2">
                            {supplier.capabilities.map((capability, capIndex) => (
                              <span
                                key={capIndex}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                              >
                                {capability}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {!supplier.history?.totalOrders && (
                        <div className="mt-3">
                          <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-md">
                            New Supplier
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

        <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedSuppliers.length === 0 ? (
              <span className="text-red-600">Please select at least one supplier</span>
            ) : (
              <span>{selectedSuppliers.length} supplier{selectedSuppliers.length !== 1 ? 's' : ''} selected</span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleContinue}
              disabled={selectedSuppliers.length === 0}
            >
              Continue to Draft RFQ
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

