import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'
import { useDemoState } from '../lib/demoState'
import { getThreadId, getThreadEmails, getThreadRoot } from '../lib/emailUtils'

export default function ClarificationInterface({ email, onSubmit, onForward }) {
  // Try to use demo state if available
  let demoState = null
  try {
    demoState = useDemoState()
  } catch (e) {
    // Not in demo mode, continue without demo state
  }
  
  const [answers, setAnswers] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!email || !email.needsClarification || !email.clarificationQuestions) {
    return null
  }

  const questions = email.clarificationQuestions
  const questionCount = questions.length
  const supplierName = email.from ? email.from.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Supplier'

  const handleAnswerChange = (questionId, type, value = '') => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { type, value }
    }))
  }

  const allQuestionsAnswered = questions.every(q => answers[q.id] && (answers[q.id].type === 'suggestion' || (answers[q.id].type === 'custom' && answers[q.id].value.trim())))

  const handleSubmit = async () => {
    if (!allQuestionsAnswered) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Update demo state if available
    if (demoState && email.rfqId) {
      demoState.answerClarification(email.rfqId, answers)
      
      // Get thread information
      const threadId = email.threadId || getThreadId(email.rfqId, email.from)
      const threadRoot = getThreadRoot(email, demoState.emails)
      
      // Create clarification response email
      const responseEmail = {
        id: `clarification-response-${email.id}-${Date.now()}`,
        subject: `RE: ${email.subject}`,
        from: 'procurement-agent@company.com',
        to: email.from, // Send to supplier
        date: new Date().toISOString(),
        body: `Dear ${supplierName},

Thank you for your clarification request. Please find our responses below:

${questions.map((q, i) => {
          const answer = answers[q.id]
          const responseText = answer?.type === 'suggestion' 
            ? q.agentSuggestion 
            : answer?.value || 'No response provided'
          return `**Question ${i + 1}: ${q.question}**
**Response:** ${responseText}`
        }).join('\n\n')}

We look forward to receiving your quote.

Best regards,
ProcureFlow Agent
Procurement Department`,
        read: true,
        folder: 'sent',
        attachments: [],
        isAgentEmail: true,
        rfqId: email.rfqId,
        rfqStatus: 'sent', // Back to awaiting response
        clarificationAnswers: answers,
        partName: email.partName,
        threadId: threadId,
        inReplyTo: email.id,
        threadIndex: 2 // Our response is index 2
      }
      
      // Update the clarification email: remove needsClarification
      demoState.setEmails(prevEmails => {
        const updated = prevEmails.map(e => {
          if (e.id === email.id) {
            return {
              ...e,
              needsClarification: false,
              read: true
            }
          }
          return e
        })
        // Add the response email
        return [responseEmail, ...updated]
      })
      
      // Update selected email to show the response
      demoState.setSelectedEmail(responseEmail)
    }
    
    if (onSubmit) {
      onSubmit(answers)
    }
  }

  const handleForward = async () => {
    if (!allQuestionsAnswered) {
      alert('Please answer all questions before forwarding.')
      return
    }

    // Create a forward email to Sarah Chen
    if (demoState && email.rfqId) {
      const threadId = email.threadId || getThreadId(email.rfqId, email.from)
      
      const forwardEmail = {
        id: `forward-${email.rfqId}-${Date.now()}`,
        subject: `Fwd: ${email.subject}`,
        from: 'procurement-agent@company.com',
        to: 'sarah.chen@company.com',
        date: new Date().toISOString(),
        body: `Hello Sarah,

The supplier ${supplierName} has requested clarification on RFQ-${email.rfqId}. Please review the questions and suggested responses below:

${questions.map((q, i) => {
          const answer = answers[q.id]
          return `**Question ${i + 1}: ${q.question}**
${answer?.type === 'suggestion' ? `Suggested Response: ${q.agentSuggestion}` : `Custom Response: ${answer?.value || 'Not answered'}`}`
        }).join('\n\n')}

Please review and provide guidance.

Best regards,
ProcureFlow Agent`,
        read: false,
        folder: 'inbox',
        attachments: [],
        isAgentEmail: true, // Mark as agent email so it shows in awaiting responses
        rfqId: email.rfqId,
        needsEngineerReview: true, // Mark for engineer review
        partName: email.partName,
        threadId: threadId,
        inReplyTo: email.id,
        threadIndex: 2, // Forward is also index 2 (same level as response)
        rfqStatus: 'sent' // Awaiting engineer review
      }

      // Add the forward email to the list
      demoState.setEmails(prevEmails => [forwardEmail, ...prevEmails])
      
      // Select the forward email
      demoState.setSelectedEmail(forwardEmail)
    }
    
    if (onForward) {
      onForward(answers)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg"
      >
        <div className="flex items-center space-x-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.1 }}
          >
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>
          <div>
            <p className="font-semibold text-green-900">Responses sent successfully</p>
            <p className="text-sm text-green-700 mt-1">Your answers have been sent to {supplierName}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      data-clarification-interface
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 border-t border-gray-200 pt-6"
    >
      {/* Header */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className="font-semibold text-gray-900">Agent needs your input to continue</h3>
        </div>
        <p className="text-sm text-gray-700">
          {questionCount} {questionCount === 1 ? 'question' : 'questions'} from {supplierName}
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-4 mb-6">
        {questions.map((question, index) => {
          const answer = answers[question.id]
          const hasSuggestion = question.agentSuggestion !== null && question.agentSuggestion !== undefined

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-5 bg-white card-hover"
            >
              <div className="mb-4">
                <p className="font-semibold text-gray-900 mb-2">
                  Q{index + 1}: {question.question}
                </p>
                {question.agentReasoning && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-3">
                    <div className="flex items-start space-x-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 mb-1">Agent suggestion:</p>
                        {hasSuggestion ? (
                          <p className="text-sm text-blue-800">{question.agentSuggestion}</p>
                        ) : (
                          <p className="text-sm text-blue-800">{question.agentReasoning}</p>
                        )}
                        {hasSuggestion && question.agentReasoning && (
                          <p className="text-xs text-blue-600 mt-2 italic">{question.agentReasoning}</p>
                        )}
                        {question.confidence && (
                          <p className="text-xs text-blue-500 mt-1">
                            Confidence: {question.confidence === 'high' ? 'High' : question.confidence === 'needs-human' ? 'Requires human decision' : 'Medium'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {hasSuggestion && (
                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <div className="relative mt-1">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={answer?.type === 'suggestion'}
                        onChange={() => handleAnswerChange(question.id, 'suggestion')}
                        className="sr-only"
                        aria-label="Accept suggestion"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                        answer?.type === 'suggestion'
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}>
                        {answer?.type === 'suggestion' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-full h-full rounded-full bg-white flex items-center justify-center"
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">Accept suggestion:</span>
                      <p className="text-sm text-gray-600 mt-0.5">"{question.agentSuggestion}"</p>
                    </div>
                  </label>
                )}

                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="relative mt-1">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answer?.type === 'custom'}
                      onChange={() => handleAnswerChange(question.id, 'custom')}
                      className="sr-only"
                      aria-label="Custom response"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                      answer?.type === 'custom'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {answer?.type === 'custom' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-full h-full rounded-full bg-white flex items-center justify-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">Custom response:</span>
                    {answer?.type === 'custom' && (
                      <motion.textarea
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        value={answer.value || ''}
                        onChange={(e) => handleAnswerChange(question.id, 'custom', e.target.value)}
                        placeholder="Type your response..."
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                        rows={3}
                      />
                    )}
                  </div>
                </label>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Submit Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Send responses to</p>
            <p className="text-sm text-gray-600">{supplierName}</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={handleForward}
              className="text-sm"
            >
              Forward to Sarah Chen for review
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              className="text-sm"
            >
              {isSubmitting ? 'Sending...' : 'Send Responses to Supplier'}
            </Button>
          </div>
        </div>
        {!allQuestionsAnswered && (
          <p className="text-xs text-amber-600 mt-2">
            Please answer all questions before submitting
          </p>
        )}
      </div>
    </motion.div>
  )
}

