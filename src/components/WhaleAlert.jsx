import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Activity, TrendingUp, Anchor, Radio, Waves } from 'lucide-react'
import useStore from '../utils/store'
import { formatNumber } from '../utils/helpers'

const WhaleAlert = () => {
  const { cryptoData } = useStore()
  const [whaleMovements, setWhaleMovements] = useState([])
  const [sonarPing, setSonarPing] = useState(0)
  const canvasRef = useRef(null)
  
  // Simulate whale movements based on volume data
  useEffect(() => {
    const generateWhaleMovements = () => {
      const movements = cryptoData
        .filter(crypto => crypto.total_volume > 1000000000) // $1B+ volume
        .map(crypto => ({
          id: crypto.id,
          symbol: crypto.symbol,
          name: crypto.name,
          amount: crypto.total_volume,
          type: crypto.price_change_percentage_24h > 0 ? 'buy' : 'sell',
          timestamp: Date.now(),
          priceImpact: Math.abs(crypto.price_change_percentage_24h),
          depth: Math.random() * 100,
          angle: Math.random() * 360,
          icon: crypto.image
        }))
        .slice(0, 8) // Top 8 whales
      
      setWhaleMovements(movements)
    }
    
    generateWhaleMovements()
    const interval = setInterval(generateWhaleMovements, 30000)
    
    return () => clearInterval(interval)
  }, [cryptoData])
  
  // Sonar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSonarPing(prev => (prev + 1) % 360)
    }, 50)
    
    return () => clearInterval(interval)
  }, [])
  
  // Draw sonar on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = Math.min(centerX, centerY) - 20
    
    const drawSonar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw concentric circles
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)'
      ctx.lineWidth = 1
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, (maxRadius / 4) * i, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      // Draw cross lines
      ctx.beginPath()
      ctx.moveTo(centerX, 20)
      ctx.lineTo(centerX, canvas.height - 20)
      ctx.moveTo(20, centerY)
      ctx.lineTo(canvas.width - 20, centerY)
      ctx.stroke()
      
      // Draw rotating scanner line
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate((sonarPing * Math.PI) / 180)
      
      const gradient = ctx.createLinearGradient(0, 0, maxRadius, 0)
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)')
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
      
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(maxRadius, 0)
      ctx.stroke()
      
      // Draw scanning arc
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, maxRadius, -Math.PI / 6, 0)
      ctx.closePath()
      ctx.fill()
      
      ctx.restore()
      
      // Draw whale positions
      whaleMovements.forEach((whale) => {
        const angle = (whale.angle * Math.PI) / 180
        const distance = (whale.depth / 100) * maxRadius
        const x = centerX + Math.cos(angle) * distance
        const y = centerY + Math.sin(angle) * distance
        
        // Draw whale blip
        const size = Math.log(whale.amount) / 5
        ctx.fillStyle = whale.type === 'buy' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw ripple effect for recent activity
        const age = (Date.now() - whale.timestamp) / 1000
        if (age < 5) {
          ctx.strokeStyle = whale.type === 'buy' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(x, y, size + age * 5, 0, Math.PI * 2)
          ctx.stroke()
        }
      })
    }
    
    drawSonar()
  }, [sonarPing, whaleMovements])
  
  const getWhaleSize = (amount) => {
    if (amount > 10000000000) return 'Mega Whale'
    if (amount > 5000000000) return 'Large Whale'
    if (amount > 1000000000) return 'Whale'
    return 'Baby Whale'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-8 w-full max-w-6xl"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold mb-2 text-glow">Whale Alert Sonar</h2>
          <p className="text-white/70">Tracking large crypto movements in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <Radio className="animate-pulse text-blue-400" size={24} />
          <span className="text-sm opacity-70">Active Scanning</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sonar Display */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full max-w-md mx-auto"
          />
          
          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="opacity-70">Buy Pressure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="opacity-70">Sell Pressure</span>
            </div>
          </div>
        </div>
        
        {/* Whale Activity Feed */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Waves size={20} />
            Recent Whale Activity
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {whaleMovements.map((whale, index) => (
                <motion.div
                  key={`${whale.id}-${whale.timestamp}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-alt rounded-xl p-4 border ${
                    whale.type === 'buy' 
                      ? 'border-green-500/30' 
                      : 'border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={whale.icon} 
                        alt={whale.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{whale.symbol.toUpperCase()}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            whale.type === 'buy' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {whale.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm opacity-70">{getWhaleSize(whale.amount)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNumber(whale.amount)}</p>
                      <p className="text-xs opacity-70">Volume 24h</p>
                    </div>
                  </div>
                  
                  {whale.priceImpact > 5 && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-yellow-400">
                      <AlertTriangle size={14} />
                      <span>High price impact: {whale.priceImpact.toFixed(1)}%</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Whale Statistics */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="glass-alt rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-400" size={20} />
                <span className="text-sm opacity-70">Buy Whales</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {whaleMovements.filter(w => w.type === 'buy').length}
              </p>
            </div>
            <div className="glass-alt rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="text-red-400" size={20} />
                <span className="text-sm opacity-70">Sell Whales</span>
              </div>
              <p className="text-2xl font-bold text-red-400">
                {whaleMovements.filter(w => w.type === 'sell').length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
      >
        <div className="flex items-center gap-3">
          <Anchor className="text-blue-400" size={24} />
          <div>
            <p className="font-semibold">Whale Activity Analysis</p>
            <p className="text-sm opacity-70">
              Large volume movements detected. {whaleMovements.filter(w => w.type === 'buy').length > whaleMovements.filter(w => w.type === 'sell').length 
                ? 'Accumulation phase detected - whales are buying.' 
                : 'Distribution phase detected - whales are selling.'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default WhaleAlert 