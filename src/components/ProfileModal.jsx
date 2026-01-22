import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiEdit, FiSave, FiUser, FiBriefcase, FiMapPin, FiMail, FiPhone, FiHash, FiCalendar } from 'react-icons/fi'

const ProfileModal = ({ isOpen, onClose, userProfile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(userProfile || {})

  // Sync formData when userProfile prop changes
  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile)
    }
  }, [userProfile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    onSave(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(userProfile || {})
    setIsEditing(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="glass border border-white/20 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 glass border-b border-gray-200/30 dark:border-gray-700/50 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Business Profile
            </h2>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg glass border border-blue-300/30 dark:border-blue-600/30 bg-blue-500/20 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                >
                  <FiEdit size={18} />
                  <span className="text-sm font-medium">Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-lg glass border border-gray-300/30 dark:border-gray-600/30 bg-gray-100/20 dark:bg-gray-700/20 text-gray-700 dark:text-gray-300 hover:bg-gray-200/30 dark:hover:bg-gray-600/30 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg glass border border-green-300/30 dark:border-green-600/30 bg-green-500/20 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-500/30 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <FiSave size={18} />
                    Save Changes
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Profile Avatar Section */}
            <div className="flex items-center gap-6 pb-6 border-b border-gray-200/30 dark:border-gray-700/50">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <FiUser className="text-white" size={40} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  {isEditing ? (
                    <input
                      type="text"
                      name="businessOwnerName"
                      value={formData?.businessOwnerName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg glass border border-gray-300/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/20 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  ) : (
                    formData?.businessOwnerName || 'Business Owner'
                  )}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isEditing ? (
                    <input
                      type="text"
                      name="businessName"
                      value={formData?.businessName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg glass border border-gray-300/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/20 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  ) : (
                    formData?.businessName || 'Business Name'
                  )}
                </p>
              </div>
            </div>

            {/* Business Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiBriefcase size={16} />
                  Business Type / Industry
                </label>
                {isEditing ? (
                  <select
                    name="businessType"
                    value={formData?.businessType || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg glass border border-gray-300/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/20 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select Business Type</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Textile">Textile</option>
                    <option value="Food Processing">Food Processing</option>
                    <option value="Retail">Retail</option>
                    <option value="Services">Services</option>
                    <option value="Trading">Trading</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="px-4 py-3 rounded-lg glass border border-gray-200/30 dark:border-gray-700/50 bg-white/10 dark:bg-gray-800/10 text-gray-800 dark:text-white">
                    {formData?.businessType || 'Not specified'}
                  </p>
                )}
              </div>

              {/* MSME Category */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiHash size={16} />
                  MSME Category
                </label>
                {isEditing ? (
                  <select
                    name="msmeCategory"
                    value={formData?.msmeCategory || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg glass border border-gray-300/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/20 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select Category</option>
                    <option value="Micro">Micro</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                  </select>
                ) : (
                  <p className="px-4 py-3 rounded-lg glass border border-gray-200/30 dark:border-gray-700/50 bg-white/10 dark:bg-gray-800/10 text-gray-800 dark:text-white">
                    {formData?.msmeCategory || 'Not specified'}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiMapPin size={16} />
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData?.city || ''}
                    onChange={handleInputChange}
                    placeholder="Your city"
                    className="w-full px-4 py-3 rounded-lg glass border border-gray-300/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/20 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                ) : (
                  <p className="px-4 py-3 rounded-lg glass border border-gray-200/30 dark:border-gray-700/50 bg-white/10 dark:bg-gray-800/10 text-gray-800 dark:text-white">
                    {formData?.city || 'Not specified'}
                  </p>
                )}
              </div>

              {/* State */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiMapPin size={16} />
                  State
                </label>
                {isEditing ? (
                  <select
                    name="state"
                    value={formData?.state || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg glass border border-gray-300/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/20 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select State</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="px-4 py-3 rounded-lg glass border border-gray-200/30 dark:border-gray-700/50 bg-white/10 dark:bg-gray-800/10 text-gray-800 dark:text-white">
                    {formData?.state || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiMail size={16} />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData?.email || ''}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg glass border border-gray-300/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/20 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                ) : (
                  <p className="px-4 py-3 rounded-lg glass border border-gray-200/30 dark:border-gray-700/50 bg-white/10 dark:bg-gray-800/10 text-gray-800 dark:text-white">
                    {formData?.email || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiPhone size={16} />
                  Mobile Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData?.mobileNumber || ''}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-3 rounded-lg glass border border-gray-300/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/20 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                ) : (
                  <p className="px-4 py-3 rounded-lg glass border border-gray-200/30 dark:border-gray-700/50 bg-white/10 dark:bg-gray-800/10 text-gray-800 dark:text-white">
                    {formData?.mobileNumber || 'Not specified'}
                  </p>
                )}
              </div>

              {/* GST Number */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiHash size={16} />
                  GST Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData?.gstNumber || ''}
                    onChange={handleInputChange}
                    placeholder="15-digit GSTIN"
                    className="w-full px-4 py-3 rounded-lg glass border border-gray-300/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/20 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                ) : (
                  <p className="px-4 py-3 rounded-lg glass border border-gray-200/30 dark:border-gray-700/50 bg-white/10 dark:bg-gray-800/10 text-gray-800 dark:text-white">
                    {formData?.gstNumber || 'Not registered'}
                  </p>
                )}
              </div>

              {/* Registration Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiCalendar size={16} />
                  Business Registration Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="registrationDate"
                    value={formData?.registrationDate || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg glass border border-gray-300/30 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/20 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                ) : (
                  <p className="px-4 py-3 rounded-lg glass border border-gray-200/30 dark:border-gray-700/50 bg-white/10 dark:bg-gray-800/10 text-gray-800 dark:text-white">
                    {formData?.registrationDate || 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            {/* Compliance Status Section */}
            <div className="pt-6 border-t border-gray-200/30 dark:border-gray-700/50">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Compliance Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg glass border border-green-200/30 dark:border-green-700/50 bg-green-50/30 dark:bg-green-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Compliances</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">12</p>
                </div>
                <div className="p-4 rounded-lg glass border border-yellow-200/30 dark:border-yellow-700/50 bg-yellow-50/30 dark:bg-yellow-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Upcoming Deadlines</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">3</p>
                </div>
                <div className="p-4 rounded-lg glass border border-blue-200/30 dark:border-blue-700/50 bg-blue-50/30 dark:bg-blue-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Forms Filed This Month</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProfileModal