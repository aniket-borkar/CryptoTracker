import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import useStore from '../utils/store'
import { formatNumber, formatPercentage, getPriceChangeColor } from '../utils/helpers'

const CryptoCard = ({ crypto, index }) => {
  const { setSelectedCrypto } = useStore()
  const isPositive = crypto.price_change_percentage_24h >= 0
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={() => setSelectedCrypto(crypto)}
      className="glass rounded-xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
      style={{
        boxShadow: `0 0 20px ${getPriceChangeColor(crypto.price_change_percentage_24h)}20`
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={crypto.image} 
            alt={crypto.name} 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h4 className="font-semibold">{crypto.name}</h4>
            <p className="text-sm opacity-60">{crypto.symbol.toUpperCase()}</p>
          </div>
        </div>
        <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-60">Price</span>
          <span className="font-semibold">{formatNumber(crypto.current_price)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-60">24h Change</span>
          <span 
            className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}
          >
            {formatPercentage(crypto.price_change_percentage_24h)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-60">Market Cap</span>
          <span className="font-semibold">{formatNumber(crypto.market_cap)}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <Activity size={16} className="opacity-60" />
          <div className="flex-1 mx-3 h-8">
            {crypto.sparkline_in_7d && (
              <svg className="w-full h-full" viewBox="0 0 100 30">
                <polyline
                  fill="none"
                  stroke={getPriceChangeColor(crypto.price_change_percentage_24h)}
                  strokeWidth="2"
                  points={crypto.sparkline_in_7d.price.slice(-24).map((price, i) => {
                    const prices = crypto.sparkline_in_7d.price.slice(-24)
                    const min = Math.min(...prices)
                    const max = Math.max(...prices)
                    const x = (i / (prices.length - 1)) * 100
                    const y = 30 - ((price - min) / (max - min)) * 30
                    return `${x},${y}`
                  }).join(' ')}
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const CryptoGrid = () => {
  const { cryptoData } = useStore()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cryptoData.slice(0, 12).map((crypto, index) => (
        <CryptoCard key={crypto.id} crypto={crypto} index={index} />
      ))}
    </div>
  )
}

export default CryptoGrid 