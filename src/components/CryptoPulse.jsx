import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Heart, Zap, TrendingUp } from 'lucide-react'
import useStore from '../utils/store'
import { formatNumber, formatPercentage } from '../utils/helpers'

const CryptoPulse = () => {
  const canvasRef = useRef(null)
  const { cryptoData } = useStore()
  const [marketVitals, setMarketVitals] = useState({
    heartRate: 0,
    pressure: 0,
    energy: 0,
    momentum: 0
  })
  const animationRef = useRef()
  
  useEffect(() => {
    if (cryptoData.length === 0) return
    
    // Calculate market vitals
    const totalVolume = cryptoData.reduce((sum, crypto) => sum + crypto.total_volume, 0)
    const avgChange = cryptoData.reduce((sum, crypto) => sum + Math.abs(crypto.price_change_percentage_24h || 0), 0) / cryptoData.length
    const positiveCoins = cryptoData.filter(crypto => crypto.price_change_percentage_24h > 0).length
    const momentum = (positiveCoins / cryptoData.length) * 100
    
    setMarketVitals({
      heartRate: Math.min(60 + avgChange * 10, 180), // BPM based on volatility
      pressure: Math.min(totalVolume / 1e12, 200), // Blood pressure based on volume
      energy: avgChange * 10, // Energy level
      momentum: momentum // Bull/bear momentum
    })
  }, [cryptoData])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width = canvas.offsetWidth * window.devicePixelRatio
    const height = canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    const points = []
    const maxPoints = 150
    let x = 0
    
    const drawPulse = () => {
      ctx.fillStyle = 'rgba(0, 8, 20, 0.1)'
      ctx.fillRect(0, 0, width, height)
      
      // Generate heartbeat pattern
      x += 2
      const baseY = height / (2 * window.devicePixelRatio)
      let y = baseY
      
      // Create realistic heartbeat waveform
      const t = x * 0.02
      const heartbeat = Math.sin(t * marketVitals.heartRate / 60) * 20
      const spike = (x % 60 < 5) ? Math.sin((x % 60) / 5 * Math.PI) * 40 : 0
      
      y = baseY - heartbeat - spike
      
      points.push({ x, y })
      if (points.length > maxPoints) points.shift()
      
      // Draw the pulse line
      ctx.strokeStyle = marketVitals.momentum > 50 ? '#00ff88' : '#ff4444'
      ctx.lineWidth = 2
      ctx.shadowBlur = 10
      ctx.shadowColor = ctx.strokeStyle
      
      ctx.beginPath()
      points.forEach((point, i) => {
        const screenX = (point.x - x + maxPoints * 2) * 2
        if (i === 0) {
          ctx.moveTo(screenX, point.y)
        } else {
          ctx.lineTo(screenX, point.y)
        }
      })
      ctx.stroke()
      
      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1
      ctx.shadowBlur = 0
      
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, height)
        ctx.stroke()
      }
      
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(width, i)
        ctx.stroke()
      }
      
      animationRef.current = requestAnimationFrame(drawPulse)
    }
    
    drawPulse()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [marketVitals])
  
  const getVitalStatus = (vital, value) => {
    switch (vital) {
      case 'heartRate':
        if (value < 80) return { status: 'Calm', color: '#22c55e' }
        if (value < 120) return { status: 'Active', color: '#3b82f6' }
        if (value < 150) return { status: 'Excited', color: '#f59e0b' }
        return { status: 'Critical', color: '#ef4444' }
      case 'pressure':
        if (value < 50) return { status: 'Low', color: '#3b82f6' }
        if (value < 120) return { status: 'Normal', color: '#22c55e' }
        if (value < 160) return { status: 'High', color: '#f59e0b' }
        return { status: 'Extreme', color: '#ef4444' }
      case 'energy':
        if (value < 20) return { status: 'Low', color: '#6b7280' }
        if (value < 50) return { status: 'Moderate', color: '#3b82f6' }
        if (value < 80) return { status: 'High', color: '#22c55e' }
        return { status: 'Surge', color: '#f59e0b' }
      case 'momentum':
        if (value < 30) return { status: 'Bearish', color: '#ef4444' }
        if (value < 45) return { status: 'Cautious', color: '#f59e0b' }
        if (value < 55) return { status: 'Neutral', color: '#3b82f6' }
        if (value < 70) return { status: 'Bullish', color: '#22c55e' }
        return { status: 'Euphoric', color: '#00ff88' }
    }
  }
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-8 h-8 text-red-500 animate-pulse" />
          <h2 className="text-3xl font-bold">Market Pulse Monitor</h2>
        </div>
        
        {/* EKG Display */}
        <div className="relative h-48 bg-black/50 rounded-xl overflow-hidden mb-8">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
          <div className="absolute top-4 right-4 text-xs opacity-70">
            LIVE FEED
          </div>
        </div>
        
        {/* Vital Signs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            className="bg-black/30 rounded-xl p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-xs opacity-60">BPM</span>
            </div>
            <p className="text-3xl font-bold mb-1">{Math.round(marketVitals.heartRate)}</p>
            <p className="text-sm" style={{ color: getVitalStatus('heartRate', marketVitals.heartRate).color }}>
              {getVitalStatus('heartRate', marketVitals.heartRate).status}
            </p>
            <p className="text-xs opacity-60 mt-2">Market Volatility</p>
          </motion.div>
          
          <motion.div
            className="bg-black/30 rounded-xl p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-xs opacity-60">mmHg</span>
            </div>
            <p className="text-3xl font-bold mb-1">{Math.round(marketVitals.pressure)}</p>
            <p className="text-sm" style={{ color: getVitalStatus('pressure', marketVitals.pressure).color }}>
              {getVitalStatus('pressure', marketVitals.pressure).status}
            </p>
            <p className="text-xs opacity-60 mt-2">Trading Volume</p>
          </motion.div>
          
          <motion.div
            className="bg-black/30 rounded-xl p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-xs opacity-60">%</span>
            </div>
            <p className="text-3xl font-bold mb-1">{Math.round(marketVitals.energy)}</p>
            <p className="text-sm" style={{ color: getVitalStatus('energy', marketVitals.energy).color }}>
              {getVitalStatus('energy', marketVitals.energy).status}
            </p>
            <p className="text-xs opacity-60 mt-2">Market Energy</p>
          </motion.div>
          
          <motion.div
            className="bg-black/30 rounded-xl p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-xs opacity-60">%</span>
            </div>
            <p className="text-3xl font-bold mb-1">{Math.round(marketVitals.momentum)}</p>
            <p className="text-sm" style={{ color: getVitalStatus('momentum', marketVitals.momentum).color }}>
              {getVitalStatus('momentum', marketVitals.momentum).status}
            </p>
            <p className="text-xs opacity-60 mt-2">Bull Momentum</p>
          </motion.div>
        </div>
        
        <div className="mt-6 p-4 bg-black/20 rounded-lg">
          <p className="text-sm opacity-70 text-center">
            The Crypto Pulse Monitor tracks market health in real-time, converting trading data into vital signs.
            Just like a medical monitor, it helps diagnose the overall condition of the cryptocurrency market.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default CryptoPulse 