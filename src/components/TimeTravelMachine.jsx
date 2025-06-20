import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Calendar, Rewind, FastForward, Play, Pause, Info, TrendingUp, TrendingDown } from 'lucide-react'
import useStore from '../utils/store'
import { formatNumber, formatPercentage } from '../utils/helpers'

const TimeTravelMachine = () => {
  const { cryptoData } = useStore()
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [historicalData, setHistoricalData] = useState([])
  
  // Select Bitcoin by default
  useEffect(() => {
    if (cryptoData.length > 0 && !selectedCrypto) {
      setSelectedCrypto(cryptoData[0])
    }
  }, [cryptoData, selectedCrypto])
  
  // Generate simulated historical data
  useEffect(() => {
    if (!selectedCrypto) return
    
    const generateHistoricalData = () => {
      const data = []
      const basePrice = selectedCrypto.current_price
      const volatility = selectedCrypto.price_change_percentage_24h / 100
      
      for (let i = 365; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        // Simulate price with random walk
        const randomWalk = (Math.random() - 0.5) * 2 * volatility
        const trendFactor = i > 180 ? 0.8 : 1.2 // Bear market first half, bull market second half
        const price = basePrice * trendFactor * (1 + randomWalk) * (365 - i) / 365
        
        data.push({
          date,
          price,
          volume: selectedCrypto.total_volume * (0.5 + Math.random()),
          marketCap: price * selectedCrypto.circulating_supply
        })
      }
      
      setHistoricalData(data)
    }
    
    generateHistoricalData()
  }, [selectedCrypto])
  
  // Auto-play time travel
  useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      setCurrentDate(prev => {
        const next = new Date(prev)
        next.setDate(next.getDate() + speed)
        
        // Stop at present
        if (next > new Date()) {
          setIsPlaying(false)
          return new Date()
        }
        
        return next
      })
    }, 100)
    
    return () => clearInterval(interval)
  }, [isPlaying, speed])
  
  const currentDataPoint = useMemo(() => {
    if (!historicalData.length) return null
    
    const point = historicalData.find(d => {
      const daysDiff = Math.abs((d.date - currentDate) / (1000 * 60 * 60 * 24))
      return daysDiff < 1
    })
    
    return point || historicalData[historicalData.length - 1]
  }, [currentDate, historicalData])
  
  const priceChange = useMemo(() => {
    if (!currentDataPoint || !historicalData.length) return 0
    
    const startPrice = historicalData[0].price
    return ((currentDataPoint.price - startPrice) / startPrice) * 100
  }, [currentDataPoint, historicalData])
  
  const handleDateChange = (days) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + days)
    
    const minDate = new Date()
    minDate.setDate(minDate.getDate() - 365)
    
    if (newDate >= minDate && newDate <= new Date()) {
      setCurrentDate(newDate)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-8 w-full max-w-6xl"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold mb-2 text-glow">Time Travel Machine</h2>
          <p className="text-white/70">Journey through crypto price history</p>
        </div>
        <Clock className="text-purple-400" size={32} />
      </div>
      
      {/* Crypto Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-3 opacity-70">Select Cryptocurrency</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cryptoData.slice(0, 8).map(crypto => (
            <button
              key={crypto.id}
              onClick={() => setSelectedCrypto(crypto)}
              className={`glass-alt rounded-xl p-3 transition-all ${
                selectedCrypto?.id === crypto.id
                  ? 'border-2 border-purple-500 bg-purple-500/20'
                  : 'border border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />
                <span className="font-semibold">{crypto.symbol.toUpperCase()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {selectedCrypto && currentDataPoint && (
        <>
          {/* Time Display */}
          <div className="mb-8">
            <div className="glass-alt rounded-2xl p-6 text-center">
              <div className="text-5xl font-bold mb-2 font-mono text-glow">
                {currentDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-2xl opacity-70">
                {currentDate.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
          
          {/* Price Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              key={currentDataPoint.price}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-alt rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src={selectedCrypto.image} 
                  alt={selectedCrypto.name} 
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-semibold text-lg">{selectedCrypto.name}</span>
              </div>
              <div className="text-3xl font-bold mb-2">
                {formatNumber(currentDataPoint.price)}
              </div>
              <div className={`flex items-center gap-2 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                <span className="font-semibold">{formatPercentage(priceChange)}</span>
                <span className="text-sm opacity-70">from start</span>
              </div>
            </motion.div>
            
            <motion.div
              key={currentDataPoint.marketCap}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-alt rounded-xl p-6"
            >
              <h3 className="text-sm opacity-70 mb-2">Market Cap</h3>
              <div className="text-2xl font-bold">
                {formatNumber(currentDataPoint.marketCap)}
              </div>
            </motion.div>
            
            <motion.div
              key={currentDataPoint.volume}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-alt rounded-xl p-6"
            >
              <h3 className="text-sm opacity-70 mb-2">24h Volume</h3>
              <div className="text-2xl font-bold">
                {formatNumber(currentDataPoint.volume)}
              </div>
            </motion.div>
          </div>
          
          {/* Time Controls */}
          <div className="glass-alt rounded-2xl p-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => handleDateChange(-30)}
                className="p-3 rounded-full glass hover:bg-white/20 transition-colors"
                title="Go back 30 days"
              >
                <Rewind size={24} />
              </button>
              
              <button
                onClick={() => handleDateChange(-7)}
                className="p-3 rounded-full glass hover:bg-white/20 transition-colors"
                title="Go back 7 days"
              >
                <Rewind size={20} />
              </button>
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-4 rounded-full glass-alt hover:bg-white/20 transition-colors bg-purple-500/20"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button
                onClick={() => handleDateChange(7)}
                className="p-3 rounded-full glass hover:bg-white/20 transition-colors"
                title="Go forward 7 days"
              >
                <FastForward size={20} />
              </button>
              
              <button
                onClick={() => handleDateChange(30)}
                className="p-3 rounded-full glass hover:bg-white/20 transition-colors"
                title="Go forward 30 days"
              >
                <FastForward size={24} />
              </button>
            </div>
            
            {/* Speed Control */}
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm opacity-70">Speed:</span>
              <div className="flex gap-2">
                {[1, 2, 5, 10].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      speed === s
                        ? 'glass-alt bg-purple-500/30 border border-purple-500/50'
                        : 'glass hover:bg-white/10'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
            
            {/* Timeline Slider */}
            <div className="mt-6">
              <input
                type="range"
                min={0}
                max={365}
                value={365 - Math.floor((new Date() - currentDate) / (1000 * 60 * 60 * 24))}
                onChange={(e) => {
                  const daysAgo = 365 - parseInt(e.target.value)
                  const newDate = new Date()
                  newDate.setDate(newDate.getDate() - daysAgo)
                  setCurrentDate(newDate)
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/10"
                style={{
                  background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${
                    ((365 - Math.floor((new Date() - currentDate) / (1000 * 60 * 60 * 24))) / 365) * 100
                  }%, rgba(255,255,255,0.1) ${
                    ((365 - Math.floor((new Date() - currentDate) / (1000 * 60 * 60 * 24))) / 365) * 100
                  }%, rgba(255,255,255,0.1) 100%)`
                }}
              />
              <div className="flex justify-between mt-2 text-xs opacity-70">
                <span>1 Year Ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>
          
          {/* Historical Events */}
          <div className="mt-8 glass-alt rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Historical Context
            </h3>
            <div className="space-y-3 text-sm">
              {currentDate < new Date('2024-01-01') && (
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-semibold">Pre-2024 Era</p>
                    <p className="opacity-70">The crypto market was experiencing significant volatility and regulatory uncertainty.</p>
                  </div>
                </div>
              )}
              {currentDate >= new Date('2024-01-01') && currentDate < new Date('2024-06-01') && (
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-green-400 mt-0.5" />
                  <div>
                    <p className="font-semibold">Early 2024</p>
                    <p className="opacity-70">Bitcoin ETF approval sparked renewed institutional interest.</p>
                  </div>
                </div>
              )}
              {currentDate >= new Date('2024-06-01') && (
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-purple-400 mt-0.5" />
                  <div>
                    <p className="font-semibold">Current Period</p>
                    <p className="opacity-70">The market is showing signs of maturation with increased adoption.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}

export default TimeTravelMachine 