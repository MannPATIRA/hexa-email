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
        className="bg-outlook-sidebar rounded-lg shadow-2xl border border-outlook-border max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-outlook-border flex items-center justify-between bg-black">
          <div>
            <h2 className="text-xl font-semibold text-white">Supplier Directory</h2>
            <p className="text-sm text-outlook-text-secondary mt-1 tracking-tight">{suppliersData.length} verified entities in network</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white opacity-50 hover:opacity-100 transition-opacity">
            ✕
          </Button>
        </div>

        <div className="p-6 border-b border-outlook-border bg-outlook-bg">
          <div className="relative group">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outlook-text-tertiary group-focus-within:text-outlook-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          <input
            type="text"
              placeholder="Filter by name, domain, or capability..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black/40 border border-outlook-border rounded-lg text-white placeholder:text-outlook-text-tertiary focus:outline-none focus:ring-2 focus:ring-outlook-blue focus:border-transparent transition-all"
          />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-outlook-bg scrollbar-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSuppliers.map((supplier) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-outlook-sidebar border border-outlook-border rounded p-6 hover:border-outlook-blue/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate group-hover:text-outlook-blue transition-colors">{supplier.name}</h3>
                    <p className="text-xs text-outlook-text-secondary truncate">{supplier.email}</p>
                  </div>
                  {supplier.history?.onTimeRate && (
                    <div className="text-right pl-4">
                      <div className="text-lg font-semibold text-green-400 leading-none">
                        {(supplier.history.onTimeRate * 100).toFixed(0)}%
                      </div>
                      <div className="text-[10px] font-semibold text-outlook-text-tertiary uppercase mt-1 tracking-wide">Reliability</div>
                    </div>
                  )}
                </div>

                {supplier.history && (
                  <div className="mb-6 space-y-2.5 bg-black/20 p-4 rounded border border-white/5">
                    <div className="flex items-center justify-between text-[11px] font-medium">
                      <span className="text-outlook-text-secondary uppercase">Historical Load:</span>
                      <span className="text-white">{supplier.history.totalOrders || 0} jobs</span>
                    </div>
                    {supplier.history.averageRating && (
                      <div className="flex items-center justify-between text-[11px] font-medium">
                        <span className="text-outlook-text-secondary uppercase">Quality Metric:</span>
                        <div className="flex space-x-0.5 text-xs">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.round(supplier.history.averageRating) ? "text-yellow-400" : "text-white/10"}>★</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {supplier.history.lastOrderDate && (
                      <div className="flex items-center justify-between text-[11px] font-medium">
                        <span className="text-outlook-text-secondary uppercase">Last Activity:</span>
                        <span className="text-white">{new Date(supplier.history.lastOrderDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {supplier.capabilities && supplier.capabilities.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-semibold text-outlook-text-secondary uppercase mb-3 tracking-wide">Core Capabilities</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {supplier.capabilities.map((capability, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-outlook-blue/10 border border-outlook-blue/20 text-outlook-blue text-[10px] font-semibold rounded"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!supplier.history?.totalOrders && (
                  <div className="mt-4">
                    <span className="px-2 py-0.5 bg-yellow-900/20 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold uppercase rounded">
                      Pre-verified
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-20 bg-black/20 rounded border border-dashed border-outlook-border">
              <div className="text-4xl mb-4 opacity-10">🔍</div>
              <p className="text-outlook-text-secondary font-semibold uppercase tracking-wide">No matching entities found</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-outlook-border flex justify-end bg-black">
          <Button variant="primary" onClick={onClose} className="text-[11px] font-bold px-10 py-2 uppercase tracking-wide">
            Close Directory
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

