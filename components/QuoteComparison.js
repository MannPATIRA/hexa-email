import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'
import suppliersData from '../data/suppliers.json'

export default function QuoteComparison({ rfqId, emails, onClose, onSelectSupplier }) {
  const [selectedSupplier, setSelectedSupplier] = useState(null)

  // Get all quotes for this RFQ
  const quotes = useMemo(() => {
    return emails.filter(e => e.rfqId === rfqId && e.isQuote === true)
  }, [emails, rfqId])

  // Get RFQ details from the initial request email
  const rfqEmail = useMemo(() => {
    return emails.find(e => e.rfqId === rfqId && e.isAgentEmail && !e.isQuote)
  }, [emails, rfqId])

  // Extract part name and quantity
  const partName = rfqEmail?.subject?.match(/- (.+?) -/) || rfqEmail?.body?.match(/\*\*Part Name:\*\* (.+?)\n/)
  const partNameText = partName ? partName[1] : 'Part'
  const quantityMatch = rfqEmail?.body?.match(/Initial Quantity: (\d+)/)
  const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 150

  // Calculate totals and find best options
  const quoteData = useMemo(() => {
    return quotes.map(quote => {
      const supplier = suppliersData.find(s => s.email === quote.from || s.email === quote.to)
      const unitPrice = quote.quoteData?.unitPrice || 0
      const tooling = quote.quoteData?.tooling || 0
      const total = (unitPrice * quantity) + tooling
      const leadTime = quote.quoteData?.leadTime || 'Unknown'
      
      // Parse lead time to weeks
      const leadTimeWeeks = leadTime.match(/(\d+\.?\d*)/)?.[1] ? parseFloat(leadTime.match(/(\d+\.?\d*)/)[1]) : 8
      const requiredWeeks = 8 // From RFQ requirement
      const isAtRisk = leadTimeWeeks > requiredWeeks

      return {
        ...quote,
        supplier: supplier || { name: quote.from.split('@')[0], id: 'unknown' },
        unitPrice,
        tooling,
        total,
        leadTime,
        leadTimeWeeks,
        isAtRisk
      }
    })
  }, [quotes, quantity])

  // Find best options
  const lowestTotal = useMemo(() => {
    return quoteData.length > 0 ? Math.min(...quoteData.map(q => q.total)) : 0
  }, [quoteData])

  const fastestLeadTime = useMemo(() => {
    if (quoteData.length === 0) return null
    return Math.min(...quoteData.map(q => q.leadTimeWeeks))
  }, [quoteData])

  // Get all suppliers (including those who haven't quoted)
  const allSuppliers = useMemo(() => {
    const quotedSupplierIds = quoteData.map(q => q.supplier.id)
    const unquotedSuppliers = suppliersData.filter(s => !quotedSupplierIds.includes(s.id))
    
    return [
      ...quoteData.map(q => ({ ...q.supplier, quote: q, hasQuote: true })),
      ...unquotedSuppliers.map(s => ({ ...s, quote: null, hasQuote: false }))
    ]
  }, [quoteData])

  // Agent recommendation logic
  const recommendedSupplier = useMemo(() => {
    if (quoteData.length === 0) return null
    
    // Score suppliers based on price, lead time, and history
    const scored = quoteData.map(q => {
      let score = 0
      
      // Price score (lower is better) - 40% weight
      const priceScore = (1 - (q.total - lowestTotal) / lowestTotal) * 40
      score += priceScore
      
      // Lead time score (shorter is better) - 30% weight
      if (fastestLeadTime) {
        const leadTimeScore = (1 - (q.leadTimeWeeks - fastestLeadTime) / fastestLeadTime) * 30
        score += leadTimeScore
      }
      
      // History score - 30% weight
      if (q.supplier.history && q.supplier.history.onTimeRate) {
        score += q.supplier.history.onTimeRate * 30
      } else {
        score += 15 // Neutral score for new suppliers
      }
      
      return { ...q, score }
    })
    
    return scored.sort((a, b) => b.score - a.score)[0]
  }, [quoteData, lowestTotal, fastestLeadTime])

  if (!rfqId) {
    return null
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-outlook-sidebar rounded-lg shadow-2xl border border-outlook-border max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-outlook-border flex items-center justify-between bg-black">
            <div>
              <h2 className="text-xl font-semibold text-white">Quote Comparison</h2>
              <p className="text-xs text-outlook-text-secondary mt-1">
                {partNameText} • {quantity} units • {rfqId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-outlook-text-secondary hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Comparison Cards */}
          <div className="flex-1 overflow-y-auto p-6 bg-outlook-bg scrollbar-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {allSuppliers.map((supplier, index) => {
                const quote = supplier.quote
                const isLowest = quote && quote.total === lowestTotal
                const isFastest = quote && quote.leadTimeWeeks === fastestLeadTime
                const isRecommended = recommendedSupplier && quote && quote.supplier.id === recommendedSupplier.supplier.id

                return (
                  <motion.div
                    key={supplier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`border rounded-md p-4 transition-all duration-300 ${
                      isLowest ? 'border-green-500 bg-green-900/10' : 
                      isRecommended ? 'border-outlook-blue bg-outlook-blue/10' : 
                      'border-outlook-border bg-outlook-sidebar'
                    } ${!supplier.hasQuote ? 'opacity-50' : 'hover:border-outlook-blue/50 cursor-pointer'} ${
                      selectedSupplier === supplier.id ? 'ring-2 ring-outlook-blue bg-outlook-blue/20' : ''
                    }`}
                    onClick={() => setSelectedSupplier(supplier.id)}
                  >
                    {/* Supplier Name */}
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-white truncate">{supplier.name}</h3>
                      {!supplier.hasQuote && (
                        <div className="flex items-center space-x-2 mt-2 text-outlook-text-tertiary">
                          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-xs">Awaiting Quote</span>
                        </div>
                      )}
                    </div>

                    {supplier.hasQuote && quote ? (
                      <>
                        {/* Price */}
                        <div className="mb-3 pb-3 border-b border-outlook-border">
                          <div className="flex items-baseline space-x-1">
                            <span className="text-2xl font-semibold text-white">
                              ${quote.unitPrice.toFixed(2)}
                            </span>
                            <span className="text-xs text-outlook-text-secondary">/ea</span>
                          </div>
                          {isLowest && (
                            <div className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-500/20 text-green-400 border border-green-500/30 mt-1">
                              Lowest Price
                            </div>
                          )}
                        </div>

                        {/* Tooling */}
                        <div className="mb-3 text-xs flex justify-between">
                          <span className="text-outlook-text-secondary">Tooling:</span>
                          <span className="font-medium text-white">
                            {quote.tooling > 0 ? `$${quote.tooling.toLocaleString()}` : 'Included'}
                          </span>
                        </div>

                        {/* Total */}
                        <div className="mb-3 pb-3 border-b border-outlook-border">
                          <div className="text-[10px] text-outlook-text-tertiary font-semibold mb-1">Total Cost</div>
                          <div className="text-lg font-bold text-white">
                            ${quote.total.toLocaleString()}
                          </div>
                        </div>

                        {/* Lead Time */}
                        <div className="mb-3">
                          <div className="text-xs text-outlook-text-secondary mb-1">Lead: {quote.leadTime}</div>
                          <div className="flex items-center space-x-1">
                            {quote.isAtRisk ? (
                              <span className="text-[10px] font-bold text-red-400">⚠️ At Risk</span>
                            ) : quote.leadTimeWeeks < 8 ? (
                              <div className="flex space-x-1">
                                {isFastest && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-outlook-blue/20 text-outlook-blue border border-outlook-blue/30">
                                    Fastest
                                  </span>
                                )}
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-500/20 text-green-400 border border-green-500/30">Early</span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-green-400">On Time</span>
                            )}
                          </div>
                        </div>

                        {/* History */}
                        {supplier.history && supplier.history.totalOrders > 0 ? (
                          <div className="mb-4 text-[10px] text-outlook-text-secondary space-y-1">
                            <div className="flex justify-between">
                              <span>Orders:</span>
                              <span className="text-white font-medium">{supplier.history.totalOrders}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Reliability:</span>
                              <span className="text-white font-medium">{Math.round(supplier.history.onTimeRate * 100)}%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 text-[10px] text-amber-400 italic">
                            New Partner (No History)
                          </div>
                        )}

                        {/* Select Button */}
                        <Button
                          variant={isRecommended ? 'primary' : 'secondary'}
                          onClick={() => setSelectedSupplier(supplier.id)}
                          className={`w-full text-xs font-semibold ${selectedSupplier === supplier.id ? 'bg-outlook-blue text-white border-transparent' : ''}`}
                        >
                          {selectedSupplier === supplier.id ? 'Selected' : 'Select'}
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-outlook-border rounded bg-black/10">
                        <div className="text-xs text-outlook-text-tertiary">Pending</div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Agent Recommendation */}
            {recommendedSupplier && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-outlook-blue/10 border border-outlook-blue/20 rounded-md p-5 mb-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-outlook-blue flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-white mb-1">Agent Recommendation</h4>
                    <p className="text-sm text-outlook-text-secondary mb-4">
                      Based on requirements, <span className="text-white font-semibold">{recommendedSupplier.supplier.name}</span> is the optimal selection:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-black/20 p-3 rounded border border-white/5">
                        <div className="text-[10px] font-bold text-outlook-blue mb-1 uppercase tracking-wider">Economics</div>
                        <p className="text-xs text-white">Best value with a {Math.round((1 - lowestTotal/recommendedSupplier.total) * 100)}% competitive advantage.</p>
                      </div>
                      <div className="bg-black/20 p-3 rounded border border-white/5">
                        <div className="text-[10px] font-bold text-outlook-blue mb-1 uppercase tracking-wider">Reliability</div>
                        <p className="text-xs text-white">{Math.round(recommendedSupplier.supplier.history?.onTimeRate * 100)}% on-time performance record.</p>
                      </div>
                      <div className="bg-black/20 p-3 rounded border border-white/5">
                        <div className="text-[10px] font-bold text-outlook-blue mb-1 uppercase tracking-wider">Timeline</div>
                        <p className="text-xs text-white">Lead time of {recommendedSupplier.leadTime} fits project schedule.</p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => setSelectedSupplier(recommendedSupplier.supplier.id)}
                      className="text-xs font-semibold px-6"
                    >
                      Select {recommendedSupplier.supplier.name}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-outlook-border flex items-center justify-between bg-black">
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => console.log('Request revised quotes')}
                className="text-xs font-semibold"
              >
                Request Revisions
              </Button>
              <Button
                variant="ghost"
                onClick={() => console.log('Export comparison')}
                className="text-xs font-semibold text-outlook-text-secondary"
              >
                Export PDF
              </Button>
            </div>
          <Button
            variant="primary"
            onClick={() => {
              if (selectedSupplier && onSelectSupplier) {
                // Set generating PO state first
                if (typeof window !== 'undefined' && window.demoState) {
                  window.demoState.setGeneratingPO(true)
                  window.demoState.selectSupplier(selectedSupplier)
                }
                onSelectSupplier(selectedSupplier)
              }
              if (onClose) onClose()
            }}
            disabled={!selectedSupplier}
            className="text-sm font-semibold px-8"
          >
            Approve & Generate Purchase Order
          </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

