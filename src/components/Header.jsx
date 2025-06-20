import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const Header = () => {
  return (
    <motion.div 
      className="text-center py-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex items-center justify-center gap-3 mb-4"
        whileHover={{ scale: 1.05 }}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>
      </motion.div>
      
      <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
        Welcome to Crypto Cosmos
      </h1>
      
      <p className="text-xl text-white/70 max-w-2xl mx-auto">
        Experience cryptocurrency trends like never before with stunning 3D visualizations, 
        mood rings, whale alerts, and cosmic patterns
      </p>
      
      <motion.div
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full glass text-sm"
        animate={{ 
          boxShadow: [
            '0 0 20px rgba(168, 85, 247, 0.5)',
            '0 0 40px rgba(236, 72, 153, 0.5)',
            '0 0 20px rgba(168, 85, 247, 0.5)'
          ]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <span className="animate-pulse">✨</span>
        <span>Use the Navigate menu to explore all features</span>
        <span className="animate-pulse">✨</span>
      </motion.div>
    </motion.div>
  )
}

export default Header 