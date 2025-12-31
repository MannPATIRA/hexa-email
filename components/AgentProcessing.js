import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

const PROCESSING_STEPS = [
  {
    id: 'parse',
    label: 'Parsing email content',
    subItems: ['Extracted: 150 units, 6061-T6 Aluminum, Feb 28 delivery'],
    duration: 2000
  },
  {
    id: 'drawing',
    label: 'Analyzing 2D drawing: HYD-MANIFOLD-001_Rev-C.pdf',
    subItems: [
      'Part dimensions: 145mm x 98mm x 67mm',
      'Tolerances: ISO 2768-mK, ±0.05mm on critical bores',
      'Surface finish: Ra 1.6 µm',
      '8x threaded ports identified: M10x1.0',
      'Material callout confirmed: 6061-T6 per AMS-QQ-A-250/11'
    ],
    duration: 4000
  },
  {
    id: 'model',
    label: 'Processing 3D model',
    subItems: ['STEP file validated, geometry extracted for supplier reference'],
    duration: 2000
  },
  {
    id: 'spec',
    label: 'Checking specification document',
    subItems: ['ITAR restriction identified: Domestic suppliers only'],
    duration: 2000
  },
  {
    id: 'search',
    label: 'Searching supplier database...',
    subItems: ['Evaluating capabilities, certifications, and capacity...'],
    duration: 5000,
    showProgress: true
  },
  {
    id: 'match',
    label: 'Match suppliers to requirements',
    duration: 2000
  },
  {
    id: 'generate',
    label: 'Generate and send RFQs',
    duration: 2000
  },
  {
    id: 'monitor',
    label: 'Monitor for responses',
    duration: 2000
  }
]

export default function AgentProcessing({ rfqId, partName, onComplete, onSkip }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [currentSubItemIndex, setCurrentSubItemIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [typedText, setTypedText] = useState('')

  const currentStep = PROCESSING_STEPS[currentStepIndex]

  useEffect(() => {
    if (isComplete) return

    const step = PROCESSING_STEPS[currentStepIndex]
    
    // Handle progress bar for search step
    if (step.id === 'search' && step.showProgress) {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 2
        })
      }, 100)
      
      return () => clearInterval(progressInterval)
    }

    // Handle sub-items typing animation
    if (step.subItems && step.subItems.length > 0) {
      const subItem = step.subItems[currentSubItemIndex]
      if (subItem && typedText.length < subItem.length) {
        const typingTimeout = setTimeout(() => {
          setTypedText(subItem.substring(0, typedText.length + 1))
        }, 30)
        return () => clearTimeout(typingTimeout)
      } else if (currentSubItemIndex < step.subItems.length - 1) {
        const nextSubItemTimeout = setTimeout(() => {
          setCurrentSubItemIndex(prev => prev + 1)
          setTypedText('')
        }, 500)
        return () => clearTimeout(nextSubItemTimeout)
      }
    }

    // Move to next step after duration
    const stepTimeout = setTimeout(() => {
      setCompletedSteps(prev => [...prev, step.id])
      setCurrentSubItemIndex(0)
      setTypedText('')
      setProgress(0)
      
      if (currentStepIndex < PROCESSING_STEPS.length - 1) {
        setCurrentStepIndex(prev => prev + 1)
      } else {
        setIsComplete(true)
        if (onComplete) {
          setTimeout(() => onComplete(), 1000)
        }
      }
    }, step.duration)

    return () => clearTimeout(stepTimeout)
  }, [currentStepIndex, currentSubItemIndex, typedText, isComplete, onComplete])

  const isStepCompleted = (stepId) => completedSteps.includes(stepId)
  const isStepCurrent = (stepId) => currentStep?.id === stepId && !isStepCompleted(stepId)
  const isStepFuture = (index) => index > currentStepIndex

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Processing Your Request
          </h2>
          <p className="text-lg text-gray-600">{rfqId}</p>
          {partName && (
            <p className="text-sm text-gray-500 mt-1">{partName}</p>
          )}
        </div>

        <div className="border-t border-b border-gray-200 py-6 my-6">
          {/* Processing Steps */}
          <div className="space-y-6">
            {PROCESSING_STEPS.map((step, index) => {
              const isCompleted = isStepCompleted(step.id)
              const isCurrent = isStepCurrent(step.id)
              const isFuture = isStepFuture(index)
              const stepSubItem = step.subItems?.[currentSubItemIndex]
              const showTyping = isCurrent && stepSubItem && typedText

              return (
                <div key={step.id} className="space-y-2">
                  {/* Main Step */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <motion.svg
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        </motion.div>
                      ) : isCurrent ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </motion.div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-sm ${
                          isCompleted ? 'text-gray-600' :
                          isCurrent ? 'text-blue-600 font-medium' :
                          'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </motion.p>

                      {/* Progress Bar for Search Step */}
                      {isCurrent && step.showProgress && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1 number-transition">{Math.round(progress)}%</p>
                        </div>
                      )}

                      {/* Sub-items */}
                      {step.subItems && (
                        <div className="mt-2 ml-4 space-y-1">
                          {step.subItems.map((subItem, subIndex) => {
                            const isSubItemCurrent = isCurrent && subIndex === currentSubItemIndex
                            const isSubItemCompleted = isCompleted || (isCurrent && subIndex < currentSubItemIndex)
                            const shouldShowTyping = isSubItemCurrent && typedText

                            if (isSubItemCompleted && !shouldShowTyping) {
                              return (
                                <motion.p
                                  key={subIndex}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-xs text-gray-500"
                                >
                                  └─ {subItem}
                                </motion.p>
                              )
                            }

                            if (shouldShowTyping) {
                              return (
                                <motion.p
                                  key={subIndex}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-xs text-gray-500"
                                >
                                  └─ {typedText}
                                  <span className="animate-pulse">|</span>
                                </motion.p>
                              )
                            }

                            return null
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">ℹ️</span>
            <p className="text-sm text-gray-700">
              This typically takes 2-3 minutes. You'll be notified when suppliers are identified and RFQs are ready to send.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-sm text-gray-600"
          >
            Skip to Results
          </Button>
          {isComplete ? (
            <Button
              variant="primary"
              onClick={onComplete}
              className="text-sm"
            >
              Review Suppliers & Send RFQs →
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled
              className="text-sm"
            >
              Continue Working - I'll Notify You
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

