import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Layers, Activity, Cloud, Radio, ChevronDown, Clock, Brain, Anchor } from 'lucide-react'
import Starfield from './components/Starfield'
import Header from './components/Header'
import CryptoGrid from './components/CryptoGrid'
import CryptoConstellation from './components/CryptoConstellation'
import MarketMoodRing from './components/MarketMoodRing'
import CryptoPulse from './components/CryptoPulse'
import CryptoWeather from './components/CryptoWeather'
import PriceRhythmVisualizer from './components/PriceRhythmVisualizer'
import WhaleAlert from './components/WhaleAlert'
import TimeTravelMachine from './components/TimeTravelMachine'
import SentimentAurora from './components/SentimentAurora'
import GlobalStats from './components/GlobalStats'
import { fetchTopCryptos } from './utils/api'
import useStore from './utils/store'

const NavMenu = () => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/constellation', icon: Layers, label: 'Crypto Galaxy' },
    { path: '/mood-ring', icon: Activity, label: 'Mood Ring' },
    { path: '/pulse', icon: Activity, label: 'Market Pulse' },
    { path: '/weather', icon: Cloud, label: 'Weather Outlook' },
    { path: '/rhythm', icon: Radio, label: 'Price Rhythm' },
    { path: '/whale-alert', icon: Anchor, label: 'Whale Alert' },
    { path: '/time-travel', icon: Clock, label: 'Time Travel' },
    { path: '/sentiment', icon: Brain, label: 'Sentiment Aurora' },
  ]
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
      >
        <span>Navigate</span>
        <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 right-0 glass rounded-xl p-2 min-w-[200px] z-50"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-white/10 ${
                  location.pathname === item.path ? 'bg-white/10 text-blue-400' : ''
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AppContent() {
  const { setCryptoData, setLoading, setError, loading, error } = useStore()
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await fetchTopCryptos(50)
        setCryptoData(data)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
    const interval = setInterval(loadData, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [setCryptoData, setLoading, setError])
  
  if (loading && !useStore.getState().cryptoData.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Error</h2>
          <p className="opacity-70">{error}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen">
      <Starfield />
      <div className="relative z-10">
        <div className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-glow hover:scale-105 transition-transform">
              Crypto Cosmos
            </Link>
            <NavMenu />
          </div>
        </div>
        
        <Routes>
          <Route path="/" element={
            <div className="container mx-auto px-4 py-8 space-y-12">
              <Header />
              <GlobalStats />
              <CryptoGrid />
            </div>
          } />
          <Route path="/constellation" element={<CryptoConstellation />} />
          <Route path="/mood-ring" element={
            <div className="container mx-auto px-4 py-8">
              <MarketMoodRing />
            </div>
          } />
          <Route path="/pulse" element={
            <div className="container mx-auto px-4 py-8">
              <CryptoPulse />
            </div>
          } />
          <Route path="/weather" element={
            <div className="container mx-auto px-4 py-8">
              <CryptoWeather />
            </div>
          } />
          <Route path="/rhythm" element={
            <div className="container mx-auto px-4 py-8">
              <PriceRhythmVisualizer />
            </div>
          } />
          <Route path="/whale-alert" element={<WhaleAlert />} />
          <Route path="/time-travel" element={<TimeTravelMachine />} />
          <Route path="/sentiment" element={<SentimentAurora />} />
        </Routes>
      </div>
      
      {/* Floating gradient orbs for atmosphere */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-float pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-pink-600 rounded-full filter blur-3xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600 rounded-full filter blur-3xl opacity-10 animate-float pointer-events-none" style={{ animationDelay: '4s' }} />
    </div>
  )
}

function App() {
  return (
    <Router basename="/CryptoTracker">
      <AppContent />
    </Router>
  )
}

export default App 