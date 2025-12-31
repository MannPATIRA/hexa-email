import { motion } from 'framer-motion'
import Button from './Button'

export default function SimulateRepliesButton({ onSimulate, visible }) {
  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed bottom-4 left-4 z-40"
    >
      <Button
        variant="primary"
        onClick={onSimulate}
        className="shadow-lg px-6 py-3 text-base font-semibold"
      >
        Simulate Replies
      </Button>
    </motion.div>
  )
}

