import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useStore from './utils/store'
import { fetchTopCryptos } from './utils/api'
import Starfield from './components/Starfield'
import Header from './components/Header'
import CryptoConstellation from './components/CryptoConstellation'
import MarketMoodRing from './components/MarketMoodRing'
import CryptoGrid from './components/CryptoGrid'
import GlobalStats from './components/GlobalStats'

function App() {
  const [activeView, setActiveView] = useState('constellation')
  const { setCryptoData, setLoading, setError } = useStore()
  
  useEffect(() => {
    const loadCryptoData = async () => {
      try {
        setLoading(true)
        const data = await fetchTopCryptos(50)
        setCryptoData(data)
      } catch (error) {
        setError(error.message)
        console.error('Error loading crypto data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadCryptoData()
    const interval = setInterval(loadCryptoData, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [setCryptoData, setLoading, setError])
  
  const renderView = () => {
    switch (activeView) {
      case 'constellation':
        return <CryptoConstellation />
      case 'mood':
        return (
          <div className="container mx-auto px-6 py-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center min-h-[calc(100vh-8rem)]"
            >
              <MarketMoodRing />
            </motion.div>
          </div>
        )
      case 'grid':
        return (
          <div className="container mx-auto px-6 py-24">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Cryptocurrency Overview
              </h2>
              <CryptoGrid />
            </motion.div>
          </div>
        )
      case 'global':
        return (
          <div className="container mx-auto px-6 py-24">
            <GlobalStats />
          </div>
        )
      default:
        return null
    }
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Starfield />
      <Header activeView={activeView} setActiveView={setActiveView} />
      
      <AnimatePresence mode="wait">
        <motion.main
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          {renderView()}
        </motion.main>
      </AnimatePresence>
      
      {/* Floating gradient orbs for atmosphere */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-float" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-pink-600 rounded-full filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600 rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '4s' }} />
    </div>
  )
}

export default App 