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
        className="mt-6 p-6 bg-green-900/20 border border-green-500/30 rounded-lg"
      >
        <div className="flex items-center space-x-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.1 }}
          >
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <p className="font-semibold text-green-400">Responses sent successfully</p>
            <p className="text-sm text-green-300/80 mt-1">Your answers have been sent to {supplierName}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div
      data-clarification-interface
      className="mt-6 border-t border-outlook-border pt-6"
    >
      {/* Header */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className="font-semibold text-yellow-400">Agent needs your input to continue</h3>
        </div>
        <p className="text-sm text-yellow-300/80">
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
              className="border border-outlook-border rounded p-5 bg-outlook-bg"
            >
              <div className="mb-4">
                <p className="font-semibold text-white mb-2">
                  Q{index + 1}: {question.question}
                </p>
                {question.agentReasoning && (
                  <div className="bg-outlook-blue/5 border border-outlook-blue/20 rounded p-3 mt-3">
                      <div className="flex-1">
                      <p className="text-[10px] font-bold text-outlook-blue uppercase tracking-wider mb-1">Agent recommendation:</p>
                        {hasSuggestion ? (
                        <p className="text-sm text-white/90">{question.agentSuggestion}</p>
                        ) : (
                        <p className="text-sm text-white/90">{question.agentReasoning}</p>
                        )}
                        {hasSuggestion && question.agentReasoning && (
                        <p className="text-[11px] text-outlook-text-secondary mt-2 italic font-medium">"{question.agentReasoning}"</p>
                        )}
                        {question.confidence && (
                        <p className="text-[10px] font-bold text-outlook-blue/70 mt-2 uppercase tracking-tight">
                          Confidence Score: {question.confidence === 'high' ? 'High' : question.confidence === 'needs-human' ? 'Action Required' : 'Medium'}
                          </p>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Answer Options */}
              <div className="space-y-4">
                {hasSuggestion && (
                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <div className="mt-1 flex-shrink-0">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={answer?.type === 'suggestion'}
                        onChange={() => handleAnswerChange(question.id, 'suggestion')}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${
                        answer?.type === 'suggestion' ? 'bg-outlook-blue border-outlook-blue' : 'bg-black border-outlook-border'
                      }`}>
                        {answer?.type === 'suggestion' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-white">Accept recommendation</span>
                      <p className="text-sm text-outlook-text-secondary mt-0.5 truncate italic">"{question.agentSuggestion}"</p>
                    </div>
                  </label>
                )}

                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="mt-1 flex-shrink-0">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answer?.type === 'custom'}
                      onChange={() => handleAnswerChange(question.id, 'custom')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${
                      answer?.type === 'custom' ? 'bg-outlook-blue border-outlook-blue' : 'bg-black border-outlook-border'
                    }`}>
                      {answer?.type === 'custom' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-white">Custom response</span>
                    {answer?.type === 'custom' && (
                      <motion.textarea
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        value={answer.value || ''}
                        onChange={(e) => handleAnswerChange(question.id, 'custom', e.target.value)}
                        placeholder="Specify custom parameters..."
                        className="w-full mt-3 px-3 py-2 bg-outlook-sidebar border border-outlook-border rounded text-sm text-white outline-none focus:ring-1 focus:ring-outlook-blue transition-all min-h-[80px]"
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
      <div className="border-t border-outlook-border pt-6 mt-8">
        <div className="flex items-center justify-end">
          <div className="flex space-x-3 flex-shrink-0">
            <Button
              variant="secondary"
              onClick={handleForward}
              className="text-sm font-semibold"
            >
              Forward for Review
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              className="text-sm font-semibold px-8 py-2.5"
            >
              {isSubmitting ? 'Transmitting...' : 'Send to Supplier'}
            </Button>
          </div>
        </div>
        {!allQuestionsAnswered && (
          <div className="mt-4 flex items-center space-x-2 text-yellow-500/80">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-[11px] font-semibold uppercase tracking-wider">Pending responses required</p>
          </div>
        )}
      </div>
    </div>
  )
}

