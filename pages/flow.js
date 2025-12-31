import { motion } from 'framer-motion'

export default function Flow() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Flow
        </h1>
        <p className="text-gray-600">
          Flow page placeholder
        </p>
      </motion.div>
    </div>
  )
}

