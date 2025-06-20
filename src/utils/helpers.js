// Format large numbers
export const formatNumber = (num) => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

// Format percentage
export const formatPercentage = (num) => {
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(2)}%`
}

// Get color based on percentage change
export const getPriceChangeColor = (change) => {
  if (change > 10) return '#00ff88'
  if (change > 5) return '#22c55e'
  if (change > 0) return '#86efac'
  if (change > -5) return '#fbbf24'
  if (change > -10) return '#f87171'
  return '#dc2626'
}

// Get sentiment color
export const getSentimentColor = (sentiment) => {
  const colors = {
    euphoric: '#00ff88',
    bullish: '#22c55e',
    neutral: '#3b82f6',
    bearish: '#f59e0b',
    fearful: '#ef4444'
  }
  return colors[sentiment] || colors.neutral
}

// Calculate market cap dominance
export const calculateDominance = (marketCap, totalMarketCap) => {
  return ((marketCap / totalMarketCap) * 100).toFixed(2)
}

// Generate star positions for background
export const generateStars = (count = 200) => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 3 + 2
  }))
}

// Convert crypto data to constellation points
export const dataToConstellation = (cryptoData) => {
  return cryptoData.slice(0, 20).map((crypto, index) => {
    const angle = (index / 20) * Math.PI * 2
    const radius = Math.log(crypto.market_cap) / 10
    return {
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: (crypto.price_change_percentage_24h || 0) / 10,
      size: Math.log(crypto.market_cap) / 20,
      color: getPriceChangeColor(crypto.price_change_percentage_24h || 0),
      marketCap: crypto.market_cap,
      price: crypto.current_price,
      change: crypto.price_change_percentage_24h
    }
  })
}

// Generate pulse rhythm based on price volatility
export const generatePriceRhythm = (sparklineData) => {
  if (!sparklineData || sparklineData.length === 0) return []
  
  const maxPrice = Math.max(...sparklineData)
  const minPrice = Math.min(...sparklineData)
  const range = maxPrice - minPrice
  
  return sparklineData.map((price, index) => ({
    time: index,
    amplitude: (price - minPrice) / range,
    frequency: Math.abs(sparklineData[index] - (sparklineData[index - 1] || price)) / range
  }))
} 