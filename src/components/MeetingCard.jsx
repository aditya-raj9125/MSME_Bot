import { motion } from 'framer-motion'
import { FiStar, FiCalendar } from 'react-icons/fi'

const MeetingCard = () => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="p-6 rounded-xl glass border border-white/20 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-4">
        <FiStar className="text-yellow-500" size={18} />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Upcoming Compliance Deadline
        </h3>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
          <span className="text-white text-sm font-medium">⚠️</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 dark:text-white">
            GST Return Filing - GSTR-3B
          </p>
          <div className="flex items-center gap-2 mt-1">
            <FiCalendar className="text-gray-500 dark:text-gray-400" size={14} />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Due: 20 Apr 2025 (3 days left)
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MeetingCard
