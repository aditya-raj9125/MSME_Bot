import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiHome, 
  FiMessageSquare, 
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiLayout,
  FiClock,
  FiLogOut,
  FiEye
} from 'react-icons/fi'

const Sidebar = ({ collapsed, onToggle, onViewProfile, onSignOut }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef(null)

  const menuItems = [
    { icon: FiHome, label: 'Home', active: true },
    { icon: FiLayout, label: 'Dashboard' },
    { icon: FiMessageSquare, label: 'New Chat' },
  ]

  const recentActivities = {
    'Today': [
      'GST Return Filing Query',
      'Compliance Calendar Request',
      'MSME Registration Help'
    ],
    'Yesterday': [
      'TDS Form Auto-fill Request',
      'Upcoming Deadlines Check'
    ]
  }

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileMenu])

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? '80px' : '280px' }}
      className={`h-screen bg-gray-100/40 dark:bg-gray-900/40 glass border-r border-gray-300/50 dark:border-gray-700/50 flex flex-col overflow-hidden backdrop-blur-xl`}
      style={{ backdropFilter: 'blur(20px)' }}
    >
      {/* Profile Section */}
      <div className="p-4 border-b border-gray-300/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div 
            ref={profileMenuRef}
            className="flex items-center gap-3 flex-1 cursor-pointer relative"
            onClick={() => !collapsed && setShowProfileMenu(!showProfileMenu)}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <FiUser className="text-white" size={20} />
            </div>
            {!collapsed && (
              <div className="flex-1">
                <p className="text-black dark:text-white font-medium text-sm">Business Owner</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">MSME Account</p>
              </div>
            )}
            
            {/* Profile Dropdown Menu */}
            {!collapsed && (
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-48 rounded-lg glass border border-gray-200/30 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
                    style={{ backdropFilter: 'blur(20px)' }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowProfileMenu(false)
                        onViewProfile()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <FiEye size={18} />
                      <span className="text-sm font-medium">View Profile</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowProfileMenu(false)
                        onSignOut()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors border-t border-gray-200/30 dark:border-gray-700/50"
                    >
                      <FiLogOut size={18} className="text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center"
          >
            {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </button>
        </div>
      </div>

      {/* Rest of the sidebar remains the same */}
      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto scroll-smooth py-4">
        <div className="px-2 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.button
                key={index}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  item.active
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    : 'text-gray-800 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon size={20} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </motion.button>
            )
          })}
        </div>

        {/* Chat History Section */}
        {!collapsed && (
          <div className="mt-6 px-4">
            <div className="flex items-center gap-2 mb-3 px-2">
              <FiClock className="text-gray-600 dark:text-gray-400" size={16} />
              <h3 className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase">
                Chat History
              </h3>
            </div>
            <div className="space-y-4">
              {Object.entries(recentActivities).map(([day, activities]) => (
                <div key={day}>
                  <h3 className="text-gray-600 dark:text-gray-500 text-xs font-medium mb-2 px-2">
                    {day}
                  </h3>
                  <div className="space-y-1">
                    {activities.map((activity, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ x: 4 }}
                        className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/30 rounded transition-all"
                      >
                        {activity}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Sidebar