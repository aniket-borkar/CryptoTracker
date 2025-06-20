import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, BarChart3, Globe, Activity } from 'lucide-react'

const Header = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'constellation', label: 'Constellation', icon: Sparkles },
    { id: 'mood', label: 'Market Mood', icon: Activity },
    { id: 'grid', label: 'Overview', icon: BarChart3 },
    { id: 'global', label: 'Global Stats', icon: Globe },
  ]
  
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 glass-dark"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Crypto Cosmos
            </h1>
          </motion.div>
          
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeView === item.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline">{item.label}</span>
                </motion.button>
              )
            })}
          </nav>
        </div>
      </div>
    </motion.header>
  )
}

export default Header 