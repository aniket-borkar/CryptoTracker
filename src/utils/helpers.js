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
  return cryptoData.slice(0, 30).map((crypto, index) => {
    // Create a more dynamic 3D spiral galaxy layout
    const goldenRatio = 1.618
    const angleStep = Math.PI * 2 * goldenRatio
    const angle = index * angleStep
    
    // Use market cap for distance from center (logarithmic scale)
    const marketCapNorm = Math.log(crypto.market_cap) / Math.log(cryptoData[0].market_cap)
    const radius = 2 + marketCapNorm * 15
    
    // Create vertical variation based on price change
    const priceChange = crypto.price_change_percentage_24h || 0
    const height = (priceChange / 100) * 5
    
    // Add some randomness for organic feel
    const noise = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 2
    }
    
    return {
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      x: Math.cos(angle) * radius + noise.x,
      y: height + Math.sin(index * 0.3) * 2 + noise.y,
      z: Math.sin(angle) * radius + noise.z,
      size: 0.3 + (marketCapNorm * 0.7),
      color: getPriceChangeColor(crypto.price_change_percentage_24h || 0),
      marketCap: crypto.market_cap,
      price: crypto.current_price,
      change: crypto.price_change_percentage_24h,
      volume: crypto.total_volume,
      sparkline: crypto.sparkline_in_7d
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