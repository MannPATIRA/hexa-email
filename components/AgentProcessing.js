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
    <div className="flex items-center justify-center min-h-screen bg-black p-8">
      <div className="bg-outlook-sidebar rounded-lg shadow-2xl border border-outlook-border w-full max-w-3xl p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-outlook-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-outlook-blue/20">
            <svg className="w-8 h-8 text-outlook-blue animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">
            Agent Intelligence Active
          </h2>
          <p className="text-base text-outlook-blue font-semibold tracking-wider">{rfqId}</p>
          {partName && (
            <p className="text-xs text-outlook-text-secondary mt-2 font-medium uppercase tracking-wider opacity-60">{partName}</p>
          )}
        </div>

        <div className="border-t border-b border-outlook-border py-8 my-8 bg-black/10 rounded-lg px-6">
          {/* Processing Steps */}
          <div className="space-y-6">
            {PROCESSING_STEPS.map((step, index) => {
              const isCompleted = isStepCompleted(step.id)
              const isCurrent = isStepCurrent(step.id)
              const isFuture = isStepFuture(index)

              return (
                <div key={step.id} className="space-y-3">
                  {/* Main Step */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : isCurrent ? (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-5 h-5 rounded-full bg-outlook-blue flex items-center justify-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </motion.div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-outlook-border bg-transparent"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${
                        isCompleted ? 'text-outlook-text-secondary line-through opacity-50' :
                        isCurrent ? 'text-white font-semibold' :
                        'text-outlook-text-tertiary'
                      }`}>
                        {step.label}
                      </p>

                      {/* Progress Bar for Search Step */}
                      {isCurrent && step.showProgress && (
                        <div className="mt-4 max-w-md">
                          <div className="w-full bg-outlook-bg rounded-full h-1 overflow-hidden border border-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                              className="h-full rounded-full bg-outlook-blue"
                            />
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-[10px] font-semibold text-outlook-blue uppercase tracking-wider">Analyzing Network</p>
                            <p className="text-[10px] font-medium text-white">{Math.round(progress)}%</p>
                          </div>
                        </div>
                      )}

                      {/* Sub-items */}
                      {isCurrent && step.subItems && (
                        <div className="mt-3 ml-1 space-y-1.5 border-l border-outlook-border/30 pl-3">
                          {step.subItems.map((subItem, subIndex) => {
                            const isSubItemCurrent = subIndex === currentSubItemIndex
                            const isSubItemCompleted = subIndex < currentSubItemIndex
                            const shouldShowTyping = isSubItemCurrent && typedText

                            if (isSubItemCompleted) {
                              return (
                                <p key={subIndex} className="text-[11px] text-outlook-text-secondary">
                                  {subItem}
                                </p>
                              )
                            }

                            if (shouldShowTyping) {
                              return (
                                <p key={subIndex} className="text-[11px] text-outlook-blue font-medium">
                                  {typedText}
                                  <span className="w-1 h-3 bg-outlook-blue inline-block ml-1 animate-pulse align-middle"></span>
                                </p>
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
        <div className="bg-outlook-blue/5 border border-outlook-blue/10 rounded-md p-4 mb-8">
          <div className="flex items-start space-x-3">
            <svg className="w-4 h-4 text-outlook-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[11px] text-outlook-text-secondary leading-relaxed">
              Hexa Agent is autonomously analyzing supplier capabilities and market pricing. You will be notified immediately upon completion.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-[11px] font-semibold text-outlook-text-secondary hover:text-white uppercase tracking-wide"
          >
            Bypass Sequence
          </Button>
          {isComplete ? (
            <Button
              variant="primary"
              onClick={onComplete}
              className="text-[11px] font-bold px-8 py-2 uppercase tracking-wide"
            >
              Continue
            </Button>
          ) : (
            <div className="flex items-center space-x-3 px-5 py-2 rounded-md bg-white/5 border border-white/10">
              <div className="w-1.5 h-1.5 bg-outlook-blue rounded-full animate-ping"></div>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Agent Computing</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

