import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { Heart, Brain, TrendingUp, TrendingDown, AlertCircle, Sparkles } from 'lucide-react'
import * as THREE from 'three'
import useStore from '../utils/store'

const AuroraWave = ({ sentiment, intensity, position, color }) => {
  const meshRef = useRef()
  const geometryRef = useRef()
  
  useFrame((state) => {
    if (!meshRef.current || !geometryRef.current) return
    
    const time = state.clock.elapsedTime
    const positions = geometryRef.current.attributes.position
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      
      const waveX = Math.sin(x * 0.5 + time * 0.5) * intensity
      const waveY = Math.sin(y * 0.3 + time * 0.7) * intensity
      const waveZ = Math.sin(x * 0.2 + y * 0.3 + time) * intensity * 2
      
      positions.setZ(i, position[2] + waveZ + waveX + waveY)
    }
    
    positions.needsUpdate = true
    meshRef.current.rotation.z = Math.sin(time * 0.1) * 0.1
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry ref={geometryRef} args={[30, 15, 64, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={intensity}
        transparent
        opacity={0.3 + intensity * 0.3}
        side={THREE.DoubleSide}
        wireframe={false}
      />
    </mesh>
  )
}

const SentimentAurora = () => {
  const { cryptoData } = useStore()
  const [overallSentiment, setOverallSentiment] = useState(0)
  const [sentimentBreakdown, setSentimentBreakdown] = useState({
    bullish: 0,
    bearish: 0,
    neutral: 0
  })
  
  useEffect(() => {
    // Calculate overall market sentiment
    const totalChange = cryptoData.reduce((sum, crypto) => 
      sum + (crypto.price_change_percentage_24h || 0), 0
    )
    const avgChange = totalChange / (cryptoData.length || 1)
    
    // Normalize to -1 to 1 scale
    const normalized = Math.max(-1, Math.min(1, avgChange / 10))
    setOverallSentiment(normalized)
    
    // Calculate breakdown
    const bullish = cryptoData.filter(c => c.price_change_percentage_24h > 1).length
    const bearish = cryptoData.filter(c => c.price_change_percentage_24h < -1).length
    const neutral = cryptoData.length - bullish - bearish
    
    setSentimentBreakdown({
      bullish: (bullish / cryptoData.length) * 100,
      bearish: (bearish / cryptoData.length) * 100,
      neutral: (neutral / cryptoData.length) * 100
    })
  }, [cryptoData])
  
  const getSentimentColor = () => {
    if (overallSentiment > 0.5) return '#10b981' // Green
    if (overallSentiment > 0) return '#3b82f6' // Blue
    if (overallSentiment > -0.5) return '#f59e0b' // Amber
    return '#ef4444' // Red
  }
  
  const getSentimentText = () => {
    if (overallSentiment > 0.5) return 'Euphoric'
    if (overallSentiment > 0.2) return 'Bullish'
    if (overallSentiment > -0.2) return 'Neutral'
    if (overallSentiment > -0.5) return 'Bearish'
    return 'Fearful'
  }
  
  const getSentimentIcon = () => {
    if (overallSentiment > 0.5) return <Sparkles className="text-green-400" size={24} />
    if (overallSentiment > 0) return <TrendingUp className="text-blue-400" size={24} />
    if (overallSentiment > -0.5) return <AlertCircle className="text-amber-400" size={24} />
    return <TrendingDown className="text-red-400" size={24} />
  }
  
  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold mb-2 text-glow">Sentiment Aurora</h2>
            <p className="text-white/70">Market emotions visualized as cosmic lights</p>
          </div>
          <Brain className="text-purple-400" size={32} />
        </div>
        
        {/* Aurora Visualization */}
        <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
          <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
            <color attach="background" args={['#000814']} />
            <ambientLight intensity={0.1} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
            
            {/* Multiple aurora layers */}
            <AuroraWave
              sentiment={overallSentiment}
              intensity={0.8 + Math.abs(overallSentiment) * 0.5}
              position={[0, 0, 0]}
              color={getSentimentColor()}
            />
            <AuroraWave
              sentiment={overallSentiment}
              intensity={0.6 + Math.abs(overallSentiment) * 0.3}
              position={[5, 3, -2]}
              color="#8b5cf6"
            />
            <AuroraWave
              sentiment={overallSentiment}
              intensity={0.4 + Math.abs(overallSentiment) * 0.2}
              position={[-5, -3, -4]}
              color="#ec4899"
            />
            
            <fog attach="fog" args={['#000814', 10, 30]} />
          </Canvas>
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>
        
        {/* Sentiment Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-alt rounded-xl p-6 text-center"
          >
            <div className="flex justify-center mb-4">
              {getSentimentIcon()}
            </div>
            <h3 className="text-3xl font-bold mb-2" style={{ color: getSentimentColor() }}>
              {getSentimentText()}
            </h3>
            <p className="text-sm opacity-70">Overall Market Sentiment</p>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-alt rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Sentiment Score</h3>
            <div className="relative h-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-5xl font-bold">
                  {(overallSentiment * 50 + 50).toFixed(0)}
                </div>
              </div>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={getSentimentColor()}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - (overallSentiment * 0.5 + 0.5))}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
            <p className="text-center text-sm opacity-70 mt-2">0 = Fear • 100 = Greed</p>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-alt rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Market Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-400">Bullish</span>
                  <span>{sentimentBreakdown.bullish.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sentimentBreakdown.bullish}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-green-400"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-400">Neutral</span>
                  <span>{sentimentBreakdown.neutral.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sentimentBreakdown.neutral}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full bg-amber-400"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-400">Bearish</span>
                  <span>{sentimentBreakdown.bearish.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sentimentBreakdown.bearish}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-red-400"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Top Sentiment Movers */}
        <div className="glass-alt rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Heart size={20} />
            Sentiment Leaders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-3 text-green-400">Most Positive</h4>
              <div className="space-y-2">
                {cryptoData
                  .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
                  .slice(0, 3)
                  .map(crypto => (
                    <div key={crypto.id} className="flex items-center justify-between p-2 rounded-lg bg-green-500/10">
                      <div className="flex items-center gap-2">
                        <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />
                        <span className="font-medium">{crypto.symbol.toUpperCase()}</span>
                      </div>
                      <span className="text-green-400 font-semibold">
                        +{crypto.price_change_percentage_24h.toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3 text-red-400">Most Negative</h4>
              <div className="space-y-2">
                {cryptoData
                  .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
                  .slice(0, 3)
                  .map(crypto => (
                    <div key={crypto.id} className="flex items-center justify-between p-2 rounded-lg bg-red-500/10">
                      <div className="flex items-center gap-2">
                        <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />
                        <span className="font-medium">{crypto.symbol.toUpperCase()}</span>
                      </div>
                      <span className="text-red-400 font-semibold">
                        {crypto.price_change_percentage_24h.toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SentimentAurora 