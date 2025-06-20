import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, TrendingUp, DollarSign, BarChart3, Zap } from 'lucide-react'
import useStore from '../utils/store'
import { formatNumber, formatPercentage } from '../utils/helpers'

const CryptoPulse = () => {
  const canvasRef = useRef(null)
  const { cryptoData } = useStore()
  const [marketVitals, setMarketVitals] = useState({
    volatilityIndex: 0,
    liquidityFlow: 0,
    momentumStrength: 0,
    marketDominance: 0
  })
  const animationRef = useRef()
  
  useEffect(() => {
    if (cryptoData.length === 0) return
    
    // Calculate financial market vitals
    const totalVolume = cryptoData.reduce((sum, crypto) => sum + crypto.total_volume, 0)
    const totalMarketCap = cryptoData.reduce((sum, crypto) => sum + crypto.market_cap, 0)
    const avgVolatility = cryptoData.reduce((sum, crypto) => sum + Math.abs(crypto.price_change_percentage_24h || 0), 0) / cryptoData.length
    const bullishCoins = cryptoData.filter(crypto => crypto.price_change_percentage_24h > 0).length
    const topCoinsDominance = cryptoData.slice(0, 5).reduce((sum, crypto) => sum + crypto.market_cap, 0) / totalMarketCap * 100
    
    setMarketVitals({
      volatilityIndex: Math.min(avgVolatility * 5, 100), // VIX-like scale 0-100
      liquidityFlow: Math.min((totalVolume / totalMarketCap) * 100, 100), // Volume/MarketCap ratio
      momentumStrength: (bullishCoins / cryptoData.length) * 100, // Bull/Bear ratio
      marketDominance: topCoinsDominance // Top 5 dominance percentage
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
      
      // Generate market pulse pattern based on volatility
      x += 2
      const baseY = height / (2 * window.devicePixelRatio)
      let y = baseY
      
      // Create market rhythm waveform
      const t = x * 0.02
      const volatilityWave = Math.sin(t * (marketVitals.volatilityIndex / 20)) * (marketVitals.volatilityIndex / 2)
      const liquidityPulse = (x % 80 < 10) ? Math.sin((x % 80) / 10 * Math.PI) * (marketVitals.liquidityFlow / 2) : 0
      
      y = baseY - volatilityWave - liquidityPulse
      
      points.push({ x, y })
      if (points.length > maxPoints) points.shift()
      
      // Draw the market pulse line
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, marketVitals.momentumStrength > 50 ? '#00ff88' : '#ff4444')
      gradient.addColorStop(1, marketVitals.momentumStrength > 50 ? '#00cc66' : '#cc3333')
      
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.shadowBlur = 10
      ctx.shadowColor = marketVitals.momentumStrength > 50 ? '#00ff88' : '#ff4444'
      
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
      
      // Draw trading grid
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
      case 'volatilityIndex':
        if (value < 20) return { status: 'Low Risk', color: '#22c55e', description: 'Stable market conditions' }
        if (value < 40) return { status: 'Moderate', color: '#3b82f6', description: 'Normal market fluctuations' }
        if (value < 60) return { status: 'Elevated', color: '#f59e0b', description: 'Increased market uncertainty' }
        if (value < 80) return { status: 'High Risk', color: '#ef4444', description: 'Significant volatility detected' }
        return { status: 'Extreme', color: '#dc2626', description: 'Market turbulence warning' }
      case 'liquidityFlow':
        if (value < 20) return { status: 'Thin', color: '#ef4444', description: 'Low trading activity' }
        if (value < 40) return { status: 'Moderate', color: '#f59e0b', description: 'Average liquidity levels' }
        if (value < 60) return { status: 'Healthy', color: '#3b82f6', description: 'Good market depth' }
        if (value < 80) return { status: 'Strong', color: '#22c55e', description: 'High trading volume' }
        return { status: 'Exceptional', color: '#00ff88', description: 'Peak market activity' }
      case 'momentumStrength':
        if (value < 20) return { status: 'Heavy Selling', color: '#dc2626', description: 'Strong bearish pressure' }
        if (value < 40) return { status: 'Bearish', color: '#ef4444', description: 'Selling dominates' }
        if (value < 60) return { status: 'Balanced', color: '#3b82f6', description: 'Market equilibrium' }
        if (value < 80) return { status: 'Bullish', color: '#22c55e', description: 'Buying pressure building' }
        return { status: 'Strong Rally', color: '#00ff88', description: 'Powerful upward momentum' }
      case 'marketDominance':
        if (value < 40) return { status: 'Distributed', color: '#22c55e', description: 'Healthy market diversity' }
        if (value < 55) return { status: 'Balanced', color: '#3b82f6', description: 'Normal concentration' }
        if (value < 70) return { status: 'Concentrated', color: '#f59e0b', description: 'Top coins dominate' }
        return { status: 'Monopolistic', color: '#ef4444', description: 'High concentration risk' }
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
          <Activity className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold">Market Pulse Analytics</h2>
          <span className="ml-auto text-sm opacity-60">Real-Time Trading Metrics</span>
        </div>
        
        {/* Market Rhythm Display */}
        <div className="relative h-48 bg-black/50 rounded-xl overflow-hidden mb-8 border border-purple-500/20">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
          <div className="absolute top-4 left-4 text-xs">
            <span className="text-purple-400">MARKET RHYTHM</span>
          </div>
          <div className="absolute top-4 right-4 text-xs">
            <span className="text-green-400 animate-pulse">● LIVE</span>
          </div>
        </div>
        
        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-xs opacity-60">VIX</span>
            </div>
            <p className="text-3xl font-bold mb-1">{marketVitals.volatilityIndex.toFixed(1)}</p>
            <p className="text-sm font-semibold" style={{ color: getVitalStatus('volatilityIndex', marketVitals.volatilityIndex).color }}>
              {getVitalStatus('volatilityIndex', marketVitals.volatilityIndex).status}
            </p>
            <p className="text-xs opacity-60 mt-2">
              {getVitalStatus('volatilityIndex', marketVitals.volatilityIndex).description}
            </p>
          </motion.div>
          
          <motion.div
            className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-blue-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-xs opacity-60">FLOW</span>
            </div>
            <p className="text-3xl font-bold mb-1">{marketVitals.liquidityFlow.toFixed(1)}%</p>
            <p className="text-sm font-semibold" style={{ color: getVitalStatus('liquidityFlow', marketVitals.liquidityFlow).color }}>
              {getVitalStatus('liquidityFlow', marketVitals.liquidityFlow).status}
            </p>
            <p className="text-xs opacity-60 mt-2">
              {getVitalStatus('liquidityFlow', marketVitals.liquidityFlow).description}
            </p>
          </motion.div>
          
          <motion.div
            className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-xs opacity-60">MOM</span>
            </div>
            <p className="text-3xl font-bold mb-1">{marketVitals.momentumStrength.toFixed(0)}%</p>
            <p className="text-sm font-semibold" style={{ color: getVitalStatus('momentumStrength', marketVitals.momentumStrength).color }}>
              {getVitalStatus('momentumStrength', marketVitals.momentumStrength).status}
            </p>
            <p className="text-xs opacity-60 mt-2">
              {getVitalStatus('momentumStrength', marketVitals.momentumStrength).description}
            </p>
          </motion.div>
          
          <motion.div
            className="bg-gradient-to-br from-pink-900/20 to-red-900/20 rounded-xl p-6 border border-pink-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-pink-400" />
              <span className="text-xs opacity-60">DOM</span>
            </div>
            <p className="text-3xl font-bold mb-1">{marketVitals.marketDominance.toFixed(0)}%</p>
            <p className="text-sm font-semibold" style={{ color: getVitalStatus('marketDominance', marketVitals.marketDominance).color }}>
              {getVitalStatus('marketDominance', marketVitals.marketDominance).status}
            </p>
            <p className="text-xs opacity-60 mt-2">
              {getVitalStatus('marketDominance', marketVitals.marketDominance).description}
            </p>
          </motion.div>
        </div>
        
        <div className="mt-6 p-4 bg-black/20 rounded-lg border border-purple-500/10">
          <p className="text-sm opacity-70 text-center">
            Advanced market analytics combining volatility index, liquidity flow analysis, momentum indicators, 
            and dominance metrics to provide real-time trading insights.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default CryptoPulse 