import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useStore from '../utils/store'
import { getSentimentColor } from '../utils/helpers'

const MarketMoodRing = () => {
  const { cryptoData, marketSentiment, calculateMarketMood } = useStore()
  const [mood, setMood] = useState('neutral')
  const [pulseIntensity, setPulseIntensity] = useState(1)
  
  useEffect(() => {
    if (cryptoData.length > 0) {
      const currentMood = calculateMarketMood()
      setMood(currentMood)
      
      // Calculate pulse intensity based on volatility
      const volatility = cryptoData.reduce((acc, crypto) => 
        acc + Math.abs(crypto.price_change_percentage_24h || 0), 0) / cryptoData.length
      setPulseIntensity(Math.min(volatility / 5, 3))
    }
  }, [cryptoData, calculateMarketMood])
  
  const moodDescriptions = {
    euphoric: 'Extreme Greed - Market is overheated',
    bullish: 'Greed - Positive sentiment prevails',
    neutral: 'Neutral - Market is balanced',
    bearish: 'Fear - Caution advised',
    fearful: 'Extreme Fear - Maximum pessimism'
  }
  
  const ringVariants = {
    euphoric: {
      scale: [1, 1.2, 1],
      rotate: [0, 360],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }
    },
    bullish: {
      scale: [1, 1.1, 1],
      rotate: [0, 180, 360],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    neutral: {
      scale: [1, 1.05, 1],
      rotate: [0, 360],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "linear"
      }
    },
    bearish: {
      scale: [1, 0.95, 1],
      rotate: [0, -180, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    fearful: {
      scale: [1, 0.9, 1],
      rotate: [0, -90, 0, 90, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
  
  return (
    <div className="relative w-96 h-96 mx-auto">
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${getSentimentColor(mood)}, transparent, ${getSentimentColor(mood)})`,
          filter: `blur(${pulseIntensity * 2}px)`
        }}
        animate={ringVariants[mood]}
      />
      
      {/* Middle ring */}
      <motion.div
        className="absolute inset-4 rounded-full"
        style={{
          background: `radial-gradient(circle, transparent 40%, ${getSentimentColor(mood)}80 70%, transparent 100%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2 / pulseIntensity,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Inner ring */}
      <motion.div
        className="absolute inset-8 rounded-full glass-dark flex items-center justify-center"
        style={{
          boxShadow: `0 0 ${20 * pulseIntensity}px ${getSentimentColor(mood)}`,
        }}
      >
        <div className="text-center p-8">
          <motion.h3
            className="text-3xl font-bold mb-2"
            style={{ color: getSentimentColor(mood) }}
            animate={{ 
              textShadow: [
                `0 0 20px ${getSentimentColor(mood)}`,
                `0 0 40px ${getSentimentColor(mood)}`,
                `0 0 20px ${getSentimentColor(mood)}`
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {mood.toUpperCase()}
          </motion.h3>
          <p className="text-sm opacity-70 mb-4">{moodDescriptions[mood]}</p>
          
          {/* Sentiment indicators */}
          <div className="flex justify-center gap-2 mb-4">
            {Object.keys(moodDescriptions).map((moodType) => (
              <div
                key={moodType}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  moodType === mood ? 'w-8' : ''
                }`}
                style={{ backgroundColor: getSentimentColor(moodType) }}
              />
            ))}
          </div>
          
          {/* Market metrics */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="opacity-50">Volatility</p>
              <p className="font-semibold">{(pulseIntensity * 33.33).toFixed(1)}%</p>
            </div>
            <div>
              <p className="opacity-50">Active Coins</p>
              <p className="font-semibold">{cryptoData.length}</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Particle effects */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: getSentimentColor(mood),
            top: '50%',
            left: '50%',
          }}
          animate={{
            x: [0, Math.cos(i * Math.PI / 4) * 150, 0],
            y: [0, Math.sin(i * Math.PI / 4) * 150, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}

export default MarketMoodRing 