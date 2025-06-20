import axios from 'axios'

const BASE_URL = 'https://api.coingecko.com/api/v3'

// Fetch top cryptocurrencies
export const fetchTopCryptos = async (limit = 50) => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: true,
        price_change_percentage: '1h,24h,7d'
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching crypto data:', error)
    throw error
  }
}

// Fetch detailed crypto data
export const fetchCryptoDetails = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: true,
        developer_data: false,
        sparkline: true
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching crypto details:', error)
    throw error
  }
}

// Fetch historical data
export const fetchHistoricalData = async (id, days = 7) => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: days > 30 ? 'daily' : 'hourly'
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching historical data:', error)
    throw error
  }
}

// Fetch global market data
export const fetchGlobalData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/global`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching global data:', error)
    throw error
  }
}

// Fetch trending coins
export const fetchTrendingCoins = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/search/trending`)
    return response.data.coins
  } catch (error) {
    console.error('Error fetching trending coins:', error)
    throw error
  }
} 