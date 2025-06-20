import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Music, Volume2, Activity, Radio, Disc, HeadphonesIcon, Play, Pause } from 'lucide-react'
import useStore from '../utils/store'
import { formatNumber, formatPercentage } from '../utils/helpers'

const PriceRhythmVisualizer = () => {
  const { cryptoData } = useStore()
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [beatIntensity, setBeatIntensity] = useState(0)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const phaseRef = useRef(0)
  
  // Select top cryptos
  const topCryptos = cryptoData.slice(0, 8)
  
  useEffect(() => {
    if (cryptoData.length > 0 && !selectedCrypto) {
      setSelectedCrypto(cryptoData[0])
    }
  }, [cryptoData])
  
  // Calculate beat intensity
  useEffect(() => {
    if (topCryptos.length > 0) {
      const avgVolatility = topCryptos.reduce((sum, crypto) => 
        sum + Math.abs(crypto.price_change_percentage_24h || 0), 0
      ) / topCryptos.length
      
      setBeatIntensity(Math.min(avgVolatility / 10, 1))
    }
  }, [topCryptos])
  
  // Draw function
  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || !selectedCrypto) return
    
    const ctx = canvas.getContext('2d')
    canvas.width = 800
    canvas.height = 200
    
    // Clear and draw background
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath()
      ctx.moveTo(0, (canvas.height / 4) * i)
      ctx.lineTo(canvas.width, (canvas.height / 4) * i)
      ctx.stroke()
    }
    
    // Draw animated waveform
    const amplitude = selectedCrypto.price_change_percentage_24h || 0
    const color = amplitude >= 0 ? '#10b981' : '#ef4444'
    
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    
    for (let x = 0; x < canvas.width; x++) {
      const y = canvas.height / 2 + Math.sin(x * 0.02 + phaseRef.current) * 30 * (Math.abs(amplitude) / 10)
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    
    // Status text
    ctx.fillStyle = '#fff'
    ctx.font = '12px Arial'
    ctx.fillText(isPlaying ? 'Playing' : 'Paused', 10, 20)
  }
  
  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (isPlaying) {
        phaseRef.current += 0.05
        draw()
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    if (isPlaying) {
      animate()
    } else {
      draw() // Draw once when paused
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, selectedCrypto])
  
  const frequencies = topCryptos.map(crypto => ({
    id: crypto.id,
    name: crypto.symbol.toUpperCase(),
    change: crypto.price_change_percentage_24h || 0,
    color: crypto.price_change_percentage_24h >= 0 ? '#10b981' : '#ef4444',
    height: Math.abs(crypto.price_change_percentage_24h || 0) * 5
  }))
  
  return (
    <div className="glass rounded-3xl p-8 w-full max-w-6xl relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold mb-2 text-glow">Price Rhythm</h2>
          <p className="text-white/70">Market movements visualization</p>
        </div>
        <Music className="text-purple-400" size={32} />
      </div>
      
      {/* Crypto Selector */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <HeadphonesIcon size={20} className="text-purple-400" />
          <span className="text-sm font-medium opacity-70">Select Crypto</span>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {topCryptos.map(crypto => (
            <button
              key={crypto.id}
              onClick={() => setSelectedCrypto(crypto)}
              className={`glass-alt rounded-xl p-3 transition-all ${
                selectedCrypto?.id === crypto.id
                  ? 'border-2 border-purple-500 bg-purple-500/20'
                  : 'border border-white/10 hover:border-white/30'
              }`}
            >
              <img src={crypto.image} alt={crypto.name} className="w-8 h-8 mx-auto rounded-full" />
              <p className="text-xs mt-1">{crypto.symbol.toUpperCase()}</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Waveform Display */}
      <div className="glass-alt rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Activity size={20} />
            Price Waveform
          </h3>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-3 rounded-full transition-colors ${
              isPlaying 
                ? 'glass hover:bg-white/20' 
                : 'glass bg-purple-500/20 hover:bg-purple-500/30'
            }`}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
        
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl bg-black border border-purple-500/20"
          style={{ maxWidth: '100%', height: 'auto', pointerEvents: 'none' }}
        />
        
        {selectedCrypto && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="opacity-60">Change</p>
              <p className={`font-semibold ${selectedCrypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(selectedCrypto.price_change_percentage_24h || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="opacity-60">Price</p>
              <p className="font-semibold">{formatNumber(selectedCrypto.current_price || 0)}</p>
            </div>
            <div className="text-center">
              <p className="opacity-60">Volume</p>
              <p className="font-semibold">{formatNumber(selectedCrypto.total_volume || 0)}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Frequency Bars with Animation */}
      <div className="glass-alt rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Radio size={20} />
          Market Frequencies
        </h3>
        
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {frequencies.map((freq, index) => (
            <div key={freq.id} className="text-center">
              <div className="h-32 flex items-end justify-center mb-2">
                <motion.div
                  className="w-full rounded-t-lg"
                  style={{ backgroundColor: freq.color }}
                  animate={isPlaying ? {
                    height: [`${freq.height}%`, `${freq.height * 1.2}%`, `${freq.height}%`],
                  } : {
                    height: `${freq.height}%`
                  }}
                  transition={{
                    duration: 1,
                    repeat: isPlaying ? Infinity : 0,
                    delay: index * 0.1
                  }}
                />
              </div>
              <p className="text-xs font-medium">{freq.name}</p>
              <p className={`text-xs ${freq.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {freq.change.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PriceRhythmVisualizer 