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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Quote Comparison</h2>
              <p className="text-sm text-gray-600 mt-1">
                {partNameText} • {quantity} pcs • {rfqId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Comparison Cards */}
          <div className="flex-1 overflow-y-auto p-6">
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
                    className={`border-2 rounded-lg p-4 bg-white transition-all duration-300 ${
                      isLowest ? 'border-green-500 shadow-md' : 
                      isRecommended ? 'border-blue-300 shadow-sm' : 
                      'border-gray-200'
                    } ${!supplier.hasQuote ? 'opacity-60' : 'hover:scale-105 hover:shadow-lg cursor-pointer'} ${
                      selectedSupplier === supplier.id ? 'ring-4 ring-blue-500 ring-offset-2 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedSupplier(supplier.id)}
                  >
                    {/* Supplier Name */}
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                      {!supplier.hasQuote && (
                        <div className="flex items-center space-x-2 mt-2 text-gray-500">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm">Awaiting Quote</span>
                        </div>
                      )}
                    </div>

                    {supplier.hasQuote && quote ? (
                      <>
                        {/* Price */}
                        <div className="mb-3 pb-3 border-b border-gray-200">
                          <div className="flex items-baseline space-x-1">
                            <span className="text-2xl font-bold text-gray-900">
                              ${quote.unitPrice.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500">/ea</span>
                          </div>
                          {isLowest && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1"
                            >
                              ⭐ LOWEST
                            </motion.span>
                          )}
                        </div>

                        {/* Tooling */}
                        <div className="mb-3 text-sm">
                          <span className="text-gray-600">Tooling:</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {quote.tooling > 0 ? `$${quote.tooling.toLocaleString()}` : 'Included'}
                          </span>
                        </div>

                        {/* Total */}
                        <div className="mb-3 pb-3 border-b border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">TOTAL</div>
                          <div className="text-lg font-semibold text-gray-900">
                            ${quote.total.toLocaleString()}
                          </div>
                        </div>

                        {/* Lead Time */}
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 mb-1">Lead: {quote.leadTime}</div>
                          <div className="flex items-center space-x-1">
                            {quote.isAtRisk ? (
                              <>
                                <span className="text-amber-600">⚠️</span>
                                <span className="text-xs text-amber-600">At risk</span>
                              </>
                            ) : quote.leadTimeWeeks < 8 ? (
                              <>
                                {isFastest && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    🚀 FASTEST
                                  </span>
                                )}
                                <span className="text-xs text-green-600">✓ Early</span>
                              </>
                            ) : (
                              <span className="text-xs text-green-600">✓ On time</span>
                            )}
                          </div>
                        </div>

                        {/* History */}
                        {supplier.history && supplier.history.totalOrders > 0 ? (
                          <div className="mb-3 text-xs text-gray-600">
                            <div>History: {supplier.history.totalOrders} orders</div>
                            <div>{Math.round(supplier.history.onTimeRate * 100)}% on-time</div>
                          </div>
                        ) : (
                          <div className="mb-3 text-xs text-gray-500 italic">
                            New supplier
                          </div>
                        )}

                        {/* Select Button */}
                        <Button
                          variant={isRecommended ? 'primary' : 'secondary'}
                          onClick={() => setSelectedSupplier(supplier.id)}
                          className={`w-full text-sm ${selectedSupplier === supplier.id ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          {selectedSupplier === supplier.id ? 'Selected' : 'Select'}
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">⏳</div>
                        <div className="text-sm">No quote received</div>
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
                className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6"
              >
                <div className="flex items-start space-x-3 mb-3">
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-2xl"
                  >
                    🤖
                  </motion.span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Agent Recommendation</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>{recommendedSupplier.supplier.name}</strong> is recommended based on:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 mb-3 list-disc list-inside">
                      {recommendedSupplier.supplier.history && (
                        <li>Best balance of price and reliability ({Math.round(recommendedSupplier.supplier.history.onTimeRate * 100)}% on-time history)</li>
                      )}
                      {recommendedSupplier.supplier.capabilities && recommendedSupplier.supplier.capabilities.length > 0 && (
                        <li>{recommendedSupplier.supplier.capabilities[0]}</li>
                      )}
                      <li>Within budget and delivery timeline</li>
                    </ul>
                    <div className="text-xs text-gray-600 italic mb-3">
                      {quoteData.length > 1 && (
                        <>
                          Consider: {quoteData.find(q => q.leadTimeWeeks === fastestLeadTime && q.supplier.id !== recommendedSupplier.supplier.id)?.supplier.name || 'Other suppliers'} has shorter lead time if schedule is critical. 
                          {quoteData.find(q => q.total === lowestTotal && q.supplier.id !== recommendedSupplier.supplier.id) && (
                            <> {quoteData.find(q => q.total === lowestTotal)?.supplier.name} offers lowest price but is {quoteData.find(q => q.total === lowestTotal)?.supplier.history?.totalOrders === 0 ? 'unproven' : 'less proven'}.</>
                          )}
                        </>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => setSelectedSupplier(recommendedSupplier.supplier.id)}
                      className="text-sm"
                    >
                      Select {recommendedSupplier.supplier.name}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => console.log('Request revised quotes')}
                className="text-sm"
              >
                Request Revised Quotes
              </Button>
              <Button
                variant="ghost"
                onClick={() => console.log('Export comparison')}
                className="text-sm"
              >
                Export Comparison
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
            className="text-sm"
          >
            Select Supplier & Generate PO
          </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

