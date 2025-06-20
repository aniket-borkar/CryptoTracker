import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, CloudRain, CloudSnow, Sun, Zap, Wind, Droplets, ThermometerSun } from 'lucide-react'
import useStore from '../utils/store'

const CryptoWeather = () => {
  const { cryptoData, marketSentiment } = useStore()
  const [forecast, setForecast] = useState(null)
  const [currentConditions, setCurrentConditions] = useState(null)
  
  useEffect(() => {
    if (cryptoData.length === 0) return
    
    // Analyze market patterns to generate weather forecast
    const avgChange24h = cryptoData.reduce((sum, crypto) => sum + (crypto.price_change_percentage_24h || 0), 0) / cryptoData.length
    const avgChange7d = cryptoData.reduce((sum, crypto) => sum + (crypto.price_change_percentage_7d || 0), 0) / cryptoData.length
    const volatility = cryptoData.reduce((sum, crypto) => sum + Math.abs(crypto.price_change_percentage_24h || 0), 0) / cryptoData.length
    const topCoinsRising = cryptoData.slice(0, 10).filter(c => c.price_change_percentage_24h > 0).length
    
    // Determine current weather conditions
    let weatherType, temperature, windSpeed, humidity, visibility
    
    if (avgChange24h > 10) {
      weatherType = 'sunny'
      temperature = 35
    } else if (avgChange24h > 5) {
      weatherType = 'partly-cloudy'
      temperature = 28
    } else if (avgChange24h > 0) {
      weatherType = 'cloudy'
      temperature = 22
    } else if (avgChange24h > -5) {
      weatherType = 'rainy'
      temperature = 15
    } else if (avgChange24h > -10) {
      weatherType = 'stormy'
      temperature = 8
    } else {
      weatherType = 'snowy'
      temperature = -5
    }
    
    windSpeed = Math.round(volatility * 5)
    humidity = Math.round((10 - topCoinsRising) * 10)
    visibility = Math.round(100 - volatility * 2)
    
    setCurrentConditions({
      type: weatherType,
      temperature,
      windSpeed,
      humidity,
      visibility,
      description: getWeatherDescription(weatherType, avgChange24h)
    })
    
    // Generate 5-day forecast based on trends
    const forecastDays = []
    for (let i = 1; i <= 5; i++) {
      const trendFactor = avgChange7d / 7
      const projectedChange = avgChange24h + (trendFactor * i * 0.5)
      const forecastType = getWeatherFromChange(projectedChange)
      
      forecastDays.push({
        day: getDayName(i),
        type: forecastType,
        high: Math.round(temperature + projectedChange / 2),
        low: Math.round(temperature + projectedChange / 2 - 5),
        chance: Math.abs(Math.round(projectedChange * 10))
      })
    }
    
    setForecast(forecastDays)
  }, [cryptoData])
  
  const getWeatherDescription = (type, change) => {
    const descriptions = {
      sunny: `Clear skies ahead! The crypto market is experiencing strong growth with ${change.toFixed(1)}% gains.`,
      'partly-cloudy': `Mostly positive conditions with some uncertainty. Moderate gains of ${change.toFixed(1)}%.`,
      cloudy: `Overcast market conditions. Slight movements of ${change.toFixed(1)}%.`,
      rainy: `Market showers expected. Prepare for ${Math.abs(change).toFixed(1)}% decline.`,
      stormy: `Severe market turbulence! Heavy losses of ${Math.abs(change).toFixed(1)}%.`,
      snowy: `Frozen market conditions. Extreme bearish trend with ${Math.abs(change).toFixed(1)}% drop.`
    }
    return descriptions[type]
  }
  
  const getWeatherFromChange = (change) => {
    if (change > 10) return 'sunny'
    if (change > 5) return 'partly-cloudy'
    if (change > 0) return 'cloudy'
    if (change > -5) return 'rainy'
    if (change > -10) return 'stormy'
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
        <h2 className="text-3xl font-bold mb-8">Crypto Weather Forecast</h2>
        
        {/* Current Conditions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div 
            className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-8"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xl font-semibold mb-4">Current Conditions</h3>
            <div className="flex items-center justify-between mb-6">
              <div>
                <WeatherIcon type={currentConditions.type} />
                <p className="text-5xl font-bold mt-4">{currentConditions.temperature}°</p>
                <p className="text-lg opacity-70 capitalize">{currentConditions.type.replace('-', ' ')}</p>
              </div>
              <div className="text-right space-y-3">
                <div className="flex items-center gap-2 justify-end">
                  <Wind size={20} className="opacity-60" />
                  <span>{currentConditions.windSpeed} km/h</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Droplets size={20} className="opacity-60" />
                  <span>{currentConditions.humidity}%</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <ThermometerSun size={20} className="opacity-60" />
                  <span>{currentConditions.visibility}% visibility</span>
                </div>
              </div>
            </div>
            <p className="text-sm opacity-70">{currentConditions.description}</p>
          </motion.div>
          
          {/* Weather Animation */}
          <div className="relative h-64 lg:h-auto rounded-xl overflow-hidden bg-gradient-to-b from-blue-900/20 to-purple-900/20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentConditions.type}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {currentConditions.type === 'sunny' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sun size={120} className="text-yellow-400" />
                  </motion.div>
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
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {/* 5-Day Forecast */}
        <div>
          <h3 className="text-xl font-semibold mb-4">5-Day Market Forecast</h3>
          <div className="grid grid-cols-5 gap-4">
            {forecast.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/30 rounded-lg p-4 text-center"
                whileHover={{ scale: 1.05 }}
              >
                <p className="font-semibold mb-2">{day.day}</p>
                <WeatherIcon type={day.type} size={40} />
                <p className="text-sm mt-2">{day.high}°/{day.low}°</p>
                <p className="text-xs opacity-60 mt-1">{day.chance}% activity</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-black/20 rounded-lg">
          <p className="text-sm opacity-70 text-center">
            The Crypto Weather Forecast uses advanced pattern recognition to translate market conditions into weather patterns,
            making complex market dynamics instantly understandable.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default CryptoWeather 