import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Coins, Users } from 'lucide-react'
import { fetchGlobalData } from '../utils/api'
import { formatNumber, formatPercentage } from '../utils/helpers'

const StatCard = ({ icon: Icon, label, value, change, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass rounded-xl p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20`}>
        <Icon size={24} className="text-purple-400" />
      </div>
      {change && (
        <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatPercentage(change)}
        </span>
      )}
    </div>
    <p className="text-sm opacity-60 mb-1">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </motion.div>
)

const GlobalStats = () => {
  const [globalData, setGlobalData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchGlobalData()
        setGlobalData(data)
      } catch (error) {
        console.error('Error fetching global data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    const interval = setInterval(fetchData, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])
  
  if (loading || !globalData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="cosmic-loader">
          <Coins size={48} className="text-purple-400" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          Global Crypto Market
        </h2>
        <p className="text-lg opacity-70">Real-time statistics across all cryptocurrencies</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          label="Total Market Cap"
          value={formatNumber(globalData.total_market_cap.usd)}
          change={globalData.market_cap_change_percentage_24h_usd}
          delay={0}
        />
        <StatCard
          icon={TrendingUp}
          label="24h Trading Volume"
          value={formatNumber(globalData.total_volume.usd)}
          delay={0.1}
        />
        <StatCard
          icon={Coins}
          label="Active Cryptocurrencies"
          value={globalData.active_cryptocurrencies.toLocaleString()}
          delay={0.2}
        />
        <StatCard
          icon={Users}
          label="Market Cap Dominance"
          value={`BTC ${globalData.market_cap_percentage.btc.toFixed(1)}%`}
          delay={0.3}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">Market Dominance</h3>
        <div className="space-y-3">
          {Object.entries(globalData.market_cap_percentage)
            .slice(0, 5)
            .map(([coin, percentage]) => (
              <div key={coin} className="flex items-center gap-4">
                <span className="text-sm font-semibold uppercase w-12">{coin}</span>
                <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
                <span className="text-sm font-semibold w-16 text-right">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            ))}
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl p-8 text-center"
      >
        <h3 className="text-2xl font-bold mb-4">Market Sentiment Analysis</h3>
        <div className="flex justify-center items-center gap-8">
          <div className="text-center">
            <p className="text-sm opacity-60">Fear & Greed Index</p>
            <p className="text-4xl font-bold text-purple-400">
              {Math.round(50 + globalData.market_cap_change_percentage_24h_usd * 5)}
            </p>
          </div>
          <div className="w-48 h-48 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${Math.PI * 160} ${Math.PI * 160}`}
                strokeDashoffset={Math.PI * 160 * (1 - (50 + globalData.market_cap_change_percentage_24h_usd * 5) / 100)}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-lg font-semibold">
                {globalData.market_cap_change_percentage_24h_usd >= 0 ? 'Greed' : 'Fear'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default GlobalStats 