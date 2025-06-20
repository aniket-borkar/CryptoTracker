import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, CloudRain, CloudSnow, Sun, Zap, Wind, Droplets, ThermometerSun, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import useStore from '../utils/store'

const CryptoWeather = () => {
  const { cryptoData, marketSentiment } = useStore()
  const [forecast, setForecast] = useState(null)
  const [currentConditions, setCurrentConditions] = useState(null)
  
  useEffect(() => {
    if (cryptoData.length === 0) return
    
    // Analyze market patterns to generate weather forecast
    const avgReturn24h = cryptoData.reduce((sum, crypto) => sum + (crypto.price_change_percentage_24h || 0), 0) / cryptoData.length
    const avgReturn7d = cryptoData.reduce((sum, crypto) => sum + (crypto.price_change_percentage_7d || 0), 0) / cryptoData.length
    const marketVolatility = cryptoData.reduce((sum, crypto) => sum + Math.abs(crypto.price_change_percentage_24h || 0), 0) / cryptoData.length
    const bullishAssets = cryptoData.slice(0, 10).filter(c => c.price_change_percentage_24h > 0).length
    const bearishAssets = cryptoData.slice(0, 10).filter(c => c.price_change_percentage_24h < 0).length
    
    // Determine current weather conditions based on market metrics
    let weatherType, marketTemp, volatilityWind, sellingPressure, marketVisibility
    
    if (avgReturn24h > 10) {
      weatherType = 'sunny'
      marketTemp = 90 // Bull market heat
    } else if (avgReturn24h > 5) {
      weatherType = 'partly-cloudy'
      marketTemp = 75 // Warming trend
    } else if (avgReturn24h > 0) {
      weatherType = 'cloudy'
      marketTemp = 65 // Neutral territory
    } else if (avgReturn24h > -5) {
      weatherType = 'rainy'
      marketTemp = 50 // Cooling off
    } else if (avgReturn24h > -10) {
      weatherType = 'stormy'
      marketTemp = 35 // Bear territory
    } else {
      weatherType = 'snowy'
      marketTemp = 20 // Deep freeze
    }
    
    volatilityWind = Math.round(marketVolatility * 3) // Volatility as wind speed
    sellingPressure = bearishAssets * 10 // Bearish assets as humidity
    marketVisibility = Math.round(100 - marketVolatility * 2) // Clarity inversely related to volatility
    
    setCurrentConditions({
      type: weatherType,
      temperature: marketTemp,
      windSpeed: volatilityWind,
      humidity: sellingPressure,
      visibility: marketVisibility,
      description: getMarketDescription(weatherType, avgReturn24h, marketVolatility)
    })
    
    // Generate 5-day forecast based on momentum and trends
    const forecastDays = []
    for (let i = 1; i <= 5; i++) {
      const momentumFactor = avgReturn7d / 7
      const projectedReturn = avgReturn24h + (momentumFactor * i * 0.7)
      const forecastType = getWeatherFromReturn(projectedReturn)
      
      forecastDays.push({
        day: getDayName(i),
        type: forecastType,
        high: Math.round(marketTemp + projectedReturn),
        low: Math.round(marketTemp + projectedReturn - 10),
        probability: Math.min(95, Math.max(5, 50 + projectedReturn * 2))
      })
    }
    
    setForecast(forecastDays)
  }, [cryptoData])
  
  const getMarketDescription = (type, returns, volatility) => {
    const descriptions = {
      sunny: `Bull Market Conditions: Strong upward momentum with ${returns.toFixed(1)}% gains. Low volatility at ${volatility.toFixed(1)}% suggests sustained rally.`,
      'partly-cloudy': `Moderately Bullish: Positive returns of ${returns.toFixed(1)}% with some uncertainty. Volatility at ${volatility.toFixed(1)}% indicates mixed signals.`,
      cloudy: `Sideways Market: Minimal movement of ${returns.toFixed(1)}%. Volatility ${volatility.toFixed(1)}% suggests consolidation phase.`,
      rainy: `Bearish Pressure: Market declining ${Math.abs(returns).toFixed(1)}%. Increased volatility at ${volatility.toFixed(1)}% signals caution.`,
      stormy: `Market Correction: Sharp decline of ${Math.abs(returns).toFixed(1)}%. High volatility ${volatility.toFixed(1)}% indicates panic selling.`,
      snowy: `Bear Market: Severe downturn of ${Math.abs(returns).toFixed(1)}%. Extreme volatility ${volatility.toFixed(1)}% suggests capitulation.`
    }
    return descriptions[type]
  }
  
  const getWeatherFromReturn = (returns) => {
    if (returns > 10) return 'sunny'
    if (returns > 5) return 'partly-cloudy'
    if (returns > 0) return 'cloudy'
    if (returns > -5) return 'rainy'
    if (returns > -10) return 'stormy'
    return 'snowy'
  }
  
  const getDayName = (daysFromNow) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return days[date.getDay()]
  }
  
  const WeatherIcon = ({ type, size = 64 }) => {
    const icons = {
      sunny: <Sun size={size} className="text-yellow-400" />,
      'partly-cloudy': <Cloud size={size} className="text-gray-400" />,
      cloudy: <Cloud size={size} className="text-gray-600" />,
      rainy: <CloudRain size={size} className="text-blue-400" />,
      stormy: <Zap size={size} className="text-purple-400" />,
      snowy: <CloudSnow size={size} className="text-blue-200" />
    }
    return icons[type] || icons.cloudy
  }
  
  if (!currentConditions || !forecast) return null
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Market Weather Outlook</h2>
          <span className="text-sm opacity-60">Technical Analysis Forecast</span>
        </div>
        
        {/* Current Market Conditions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div 
            className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-8 border border-blue-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Current Market Climate
            </h3>
            <div className="flex items-center justify-between mb-6">
              <div>
                <WeatherIcon type={currentConditions.type} />
                <p className="text-5xl font-bold mt-4">{currentConditions.temperature}°</p>
                <p className="text-lg opacity-70 capitalize">
                  {currentConditions.type === 'sunny' ? 'Bull Run' : 
                   currentConditions.type === 'partly-cloudy' ? 'Uptrend' :
                   currentConditions.type === 'cloudy' ? 'Ranging' :
                   currentConditions.type === 'rainy' ? 'Pullback' :
                   currentConditions.type === 'stormy' ? 'Correction' : 'Bear Market'}
                </p>
              </div>
              <div className="text-right space-y-3">
                <div className="flex items-center gap-2 justify-end">
                  <Wind size={20} className="opacity-60" />
                  <div>
                    <span className="text-sm">{currentConditions.windSpeed} mph</span>
                    <p className="text-xs opacity-60">Volatility</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <TrendingDown size={20} className="opacity-60" />
                  <div>
                    <span className="text-sm">{currentConditions.humidity}%</span>
                    <p className="text-xs opacity-60">Sell Pressure</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <ThermometerSun size={20} className="opacity-60" />
                  <div>
                    <span className="text-sm">{currentConditions.visibility}%</span>
                    <p className="text-xs opacity-60">Market Clarity</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-sm opacity-80">{currentConditions.description}</p>
            </div>
          </motion.div>
          
          {/* Market Visualization */}
          <div className="relative h-64 lg:h-auto rounded-xl overflow-hidden bg-gradient-to-b from-blue-900/20 to-purple-900/20 border border-purple-500/20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentConditions.type}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {currentConditions.type === 'sunny' && (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Sun size={120} className="text-yellow-400" />
                    </motion.div>
                    <motion.div className="absolute bottom-8 flex gap-2">
                      <TrendingUp className="text-green-400" size={24} />
                      <span className="text-green-400 font-semibold">Strong Uptrend</span>
                    </motion.div>
                  </>
                )}
                {currentConditions.type === 'rainy' && (
                  <>
                    <Cloud size={100} className="text-gray-600 absolute top-10" />
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-4 bg-blue-400 rounded-full"
                        style={{ left: `${20 + i * 3}%`, top: '40%' }}
                        animate={{ y: [0, 150], opacity: [1, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeIn"
                        }}
                      />
                    ))}
                    <motion.div className="absolute bottom-8 flex gap-2">
                      <TrendingDown className="text-red-400" size={24} />
                      <span className="text-red-400 font-semibold">Selling Pressure</span>
                    </motion.div>
                  </>
                )}
                {currentConditions.type === 'stormy' && (
                  <>
                    <Cloud size={100} className="text-gray-800 absolute top-10" />
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Zap size={80} className="text-yellow-300 absolute top-20" />
                    </motion.div>
                    <motion.div className="absolute bottom-8 flex gap-2">
                      <TrendingDown className="text-red-600" size={24} />
                      <span className="text-red-600 font-semibold">Market Correction</span>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {/* 5-Day Market Forecast */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            5-Day Market Projection
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {forecast.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-black/30 to-black/50 rounded-lg p-4 text-center border border-white/10"
                whileHover={{ scale: 1.05 }}
              >
                <p className="font-semibold mb-2">{day.day}</p>
                <WeatherIcon type={day.type} size={40} />
                <div className="mt-2">
                  <p className="text-sm font-semibold">
                    {day.high > 65 ? 'Bullish' : day.high > 50 ? 'Neutral' : 'Bearish'}
                  </p>
                  <p className="text-xs opacity-60">H: {day.high}° L: {day.low}°</p>
                </div>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <div className="text-xs opacity-60">Probability</div>
                  <div className="text-xs font-semibold">{day.probability}%</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/10">
          <p className="text-sm opacity-80 text-center">
            Market Weather combines technical indicators, volatility metrics, and momentum analysis to provide
            an intuitive forecast of market conditions using familiar weather patterns.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default CryptoWeather 