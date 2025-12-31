import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from './Button'
import suppliersData from '../data/suppliers.json'

export default function SupplierListModal({ onClose }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSuppliers = suppliersData.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Suppliers</h2>
            <p className="text-sm text-gray-500 mt-1">{suppliersData.length} suppliers in database</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuppliers.map((supplier) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
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
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Orders:</span>
                      <span className="font-medium text-gray-900">{supplier.history.totalOrders || 0}</span>
                    </div>
                    {supplier.history.onTimeRate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">On-Time Rate:</span>
                        <span className="font-medium text-gray-900">{(supplier.history.onTimeRate * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    {supplier.history.averageRating && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Average Rating:</span>
                        <span className="font-medium text-gray-900">
                          {supplier.history.averageRating.toFixed(1)} stars
                        </span>
                      </div>
                    )}
                    {supplier.history.lastOrderDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Order:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(supplier.history.lastOrderDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {supplier.capabilities && supplier.capabilities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Capabilities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {supplier.capabilities.map((capability, index) => (
                        <span
                          key={index}
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
              </motion.div>
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No suppliers found matching "{searchQuery}"</p>
            </div>
          )}
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

