import { create } from 'zustand'

const useStore = create((set) => ({
  cryptoData: [],
  selectedCrypto: null,
  marketSentiment: 'neutral',
  timeframe: '24h',
  loading: true,
  error: null,
  
  setCryptoData: (data) => set({ cryptoData: data }),
  setSelectedCrypto: (crypto) => set({ selectedCrypto: crypto }),
  setMarketSentiment: (sentiment) => set({ marketSentiment: sentiment }),
  setTimeframe: (timeframe) => set({ timeframe: timeframe }),
  setLoading: (loading) => set({ loading: loading }),
  setError: (error) => set({ error: error }),
  
  // Calculate overall market mood based on price changes
  calculateMarketMood: () => {
    const { cryptoData } = useStore.getState()
    if (!cryptoData || cryptoData.length === 0) return 'neutral'
    
    const avgChange = cryptoData.reduce((acc, crypto) => 
      acc + (crypto.price_change_percentage_24h || 0), 0) / cryptoData.length
    
    if (avgChange > 5) return 'euphoric'
    if (avgChange > 2) return 'bullish'
    if (avgChange > -2) return 'neutral'
    if (avgChange > -5) return 'bearish'
    return 'fearful'
  }
}))

export default useStore 