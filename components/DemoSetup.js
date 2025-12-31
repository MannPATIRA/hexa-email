import { motion } from 'framer-motion'
import { getAllScenarios } from '../lib/demoScenarios'
import { STAGES } from '../lib/demoState'
import Button from './Button'

export default function DemoSetup({ onSelectScenario, onEnterAsEngineer }) {
  const scenarios = getAllScenarios()

  const handleScenarioSelect = (scenario) => {
    // Save scenario to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('procureflow-demo-scenario', scenario.id)
      localStorage.setItem('procureflow-demo-emails', JSON.stringify(scenario.initialEmails))
    }
    
    if (onSelectScenario) {
      onSelectScenario(scenario)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-12"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🏭</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ProcureFlow Demo
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Procurement Agent
          </p>
        </div>

        <div className="border-t border-gray-200 pt-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            Choose a demo scenario:
          </h2>

          {/* Scenario Cards */}
          <div className="space-y-4 mb-8">
            {scenarios.map((scenario) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: scenarios.indexOf(scenario) * 0.1 }}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-4xl">{scenario.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {scenario.name}
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {scenario.duration}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {scenario.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => handleScenarioSelect(scenario)}
                    className="ml-4"
                  >
                    Start
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Or:</p>
              <Button
                variant="secondary"
                onClick={onEnterAsEngineer}
                className="text-base px-6 py-3"
              >
                Enter Demo as Engineer
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Compose a new RFQ request to start from scratch
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

