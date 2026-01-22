import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiSend, FiFile, FiX, FiMic } from 'react-icons/fi'

const ChatInput = ({ onSubmit, sidebarCollapsed }) => {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Initialize Web Speech API for voice recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'en-US'
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setMessage(prev => prev + (prev ? ' ' : '') + transcript)
        setIsRecording(false)
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }
      
      recognitionInstance.onend = () => {
        setIsRecording(false)
      }
      
      setRecognition(recognitionInstance)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() || attachments.length > 0) {
      onSubmit(message, attachments)
      setMessage('')
      setAttachments([])
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const newAttachments = files.map(file => {
      const isImage = file.type.startsWith('image/')
      return {
        file,
        type: isImage ? 'image' : 'document',
        name: file.name,
        size: file.size,
        preview: isImage ? URL.createObjectURL(file) : null
      }
    })
    setAttachments([...attachments, ...newAttachments])
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleVoiceRecord = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser')
      return
    }

    if (isRecording) {
      recognition.stop()
      setIsRecording(false)
    } else {
      recognition.start()
      setIsRecording(true)
    }
  }

  const removeAttachment = (index) => {
    const newAttachments = attachments.filter((_, i) => i !== index)
    // Revoke object URLs to prevent memory leaks
    if (attachments[index].preview) {
      URL.revokeObjectURL(attachments[index].preview)
    }
    setAttachments(newAttachments)
  }

  // Calculate left margin based on sidebar state
  const leftMargin = sidebarCollapsed ? '80px' : '280px'

  return (
    <>
      {/* Hidden file input - accepts both images and documents */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="fixed bottom-6 z-10"
        style={{ left: `calc(${leftMargin} + 1.5rem)`, right: '1.5rem' }}
      >
        <form onSubmit={handleSubmit} className="relative">
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 flex flex-wrap gap-2"
            >
              {attachments.map((attachment, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-gray-200/30 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30"
                >
                  {attachment.preview ? (
                    <img src={attachment.preview} alt={attachment.name} className="w-6 h-6 rounded object-cover" />
                  ) : (
                    <FiFile className="text-gray-600 dark:text-gray-400" size={16} />
                  )}
                  <span className="text-xs text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                    {attachment.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          <div className="glass border border-gray-200/30 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg glass border border-purple-300/30 dark:border-purple-600/30 bg-purple-500/20 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/30 transition-colors"
              >
                <FiPlus size={20} />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about compliance requirements, e.g., 'Small Textile Factory in Surat' or 'What forms do I need to file this month?'"
                className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              />
              <button
                type="button"
                onClick={handleVoiceRecord}
                className={`p-2 rounded-lg glass border transition-colors ${
                  isRecording
                    ? 'border-red-300/30 dark:border-red-600/30 bg-red-500/20 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-500/30 animate-pulse'
                    : 'border-gray-300/30 dark:border-gray-600/30 bg-gray-100/20 dark:bg-gray-700/20 text-gray-600 dark:text-gray-400 hover:bg-gray-200/30 dark:hover:bg-gray-600/30'
                }`}
                title={isRecording ? 'Stop recording' : 'Start voice recording'}
              >
                <FiMic size={20} />
              </button>
              <button
                type="submit"
                className="p-2 rounded-lg glass border border-gray-300/30 dark:border-gray-600/30 bg-gray-100/20 dark:bg-gray-700/20 text-gray-600 dark:text-gray-400 hover:bg-gray-200/30 dark:hover:bg-gray-600/30 transition-colors"
              >
                <FiSend size={20} />
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </>
  )
}

export default ChatInput
