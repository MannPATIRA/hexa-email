import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useDemoState, STAGES, STAGE_ORDER } from '../lib/demoState'
import { getEventDescription, formatEventTime } from '../lib/timeProgression'
import Button from './Button'

const STAGE_LABELS = {
  [STAGES.INBOX]: 'Inbox',
  [STAGES.COMPOSE_RFQ]: 'Compose RFQ',
  [STAGES.PROCESSING]: 'Processing',
  [STAGES.SUPPLIER_MATCHING]: 'Supplier Matching',
  [STAGES.RFQS_SENT]: 'RFQs Sent',
  [STAGES.CLARIFICATION]: 'Clarification',
  [STAGES.QUOTES_RECEIVED]: 'Quotes Received',
  [STAGES.COMPARISON]: 'Comparison',
  [STAGES.PO_GENERATION]: 'PO Generation',
  [STAGES.COMPLETE]: 'Complete'
}

export default function DemoController() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const {
    currentStage,
    currentRfqId,
    advanceToStage,
    nextStage,
    previousStage,
    resetDemo,
    skipToNextEvent,
    nextEvent,
    currentTime
  } = useDemoState()

  // Check if demo mode is enabled
  useEffect(() => {
    const isDemoMode = router.query.demo === 'true' || process.env.NODE_ENV === 'development'
    setIsVisible(isDemoMode)
  }, [router.query.demo])

  if (!isVisible) return null

  const currentIndex = STAGE_ORDER.indexOf(currentStage)
  const canGoNext = currentIndex < STAGE_ORDER.length - 1
  const canGoPrevious = currentIndex > 0

  const handleJumpToStage = (stage) => {
    advanceToStage(stage)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-12 h-12' : 'w-80'
      }`}>
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full h-full flex items-center justify-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Demo Controls</h3>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-sm">
                <div className="text-gray-600 mb-1">Current:</div>
                <div className="font-medium text-gray-900">{STAGE_LABELS[currentStage]}</div>
                {currentRfqId && (
                  <div className="text-xs text-gray-500 mt-1">RFQ: {currentRfqId}</div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={previousStage}
                  disabled={!canGoPrevious}
                  className="flex-1 text-xs py-1.5"
                >
                  ← Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={nextStage}
                  disabled={!canGoNext}
                  className="flex-1 text-xs py-1.5"
                >
                  Next →
                </Button>
              </div>

              <div>
                <div className="text-xs text-gray-600 mb-2">Jump to:</div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    STAGES.INBOX,
                    STAGES.PROCESSING,
                    STAGES.QUOTES_RECEIVED,
                    STAGES.COMPARISON,
                    STAGES.PO_GENERATION
                  ].map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleJumpToStage(stage)}
                      className={`px-2 py-1 text-xs rounded ${
                        currentStage === stage
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {STAGE_LABELS[stage]}
                    </button>
                  ))}
                </div>
              </div>

              {nextEvent && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Next Event:</p>
                    <p className="text-xs font-medium text-gray-700">{getEventDescription(nextEvent)}</p>
                    <p className="text-xs text-gray-500">{formatEventTime(nextEvent.timestamp)}</p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={skipToNextEvent}
                    className="w-full text-xs"
                  >
                    ⏭️ Skip to Next Event
                  </Button>
                </div>
              )}
              
              <div className="pt-2 border-t border-gray-200 space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    resetDemo()
                    if (typeof window !== 'undefined') {
                      window.location.href = '/flow'
                    }
                  }}
                  className="w-full text-xs text-red-600 hover:text-red-700"
                >
                  Reset Demo
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('procureflow-demo-scenario')
                      window.location.href = '/flow'
                    }
                  }}
                  className="w-full text-xs text-gray-600 hover:text-gray-700"
                >
                  Show Setup Screen
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

