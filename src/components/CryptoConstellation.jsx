import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Text, Trail, Float, Stars, Html } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, ZoomIn, ZoomOut, RotateCw, Move3d, X } from 'lucide-react'
import useStore from '../utils/store'
import { dataToConstellation, formatNumber, formatPercentage, getPriceChangeColor } from '../utils/helpers'

const CryptoNode = ({ data, onClick, selectedId }) => {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const isSelected = selectedId === data.id
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      
      // Pulsating effect based on volume
      const pulseFactor = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      
      if (hovered || isSelected) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5).multiplyScalar(pulseFactor), 0.1)
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1).multiplyScalar(pulseFactor), 0.1)
      }
    }
  })
  
  const handleClick = () => {
    setClicked(true)
    onClick(data)
    setTimeout(() => setClicked(false), 1000)
  }
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={[data.x, data.y, data.z]}>
        <Trail
          width={2}
          length={6}
          color={data.color}
          attenuation={(t) => t * t}
        >
          <mesh
            ref={meshRef}
            onClick={handleClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            scale={data.size}
          >
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              color={data.color}
              emissive={data.color}
              emissiveIntensity={hovered || isSelected ? 0.8 : 0.5}
              metalness={0.8}
              roughness={0.2}
              wireframe={clicked}
            />
          </mesh>
        </Trail>
        
        {/* Always show label for top 10 coins */}
        {data.marketCapRank <= 10 && !hovered && (
          <Html
            position={[0, data.size + 1, 0]}
            center
            style={{
              transition: 'all 0.2s',
              opacity: 0.8,
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 0 10px rgba(0,0,0,0.8)',
              pointerEvents: 'none'
            }}
          >
            {data.symbol.toUpperCase()}
          </Html>
        )}
        
        {/* Detailed info on hover */}
        {hovered && (
          <Html
            position={[0, 3, 0]}
            center
            style={{
              transition: 'all 0.2s',
              pointerEvents: 'none'
            }}
          >
            <div className="bg-black/90 rounded-lg p-3 text-white text-sm backdrop-blur-sm border border-white/20">
              <div className="font-bold text-lg mb-1">{data.name}</div>
              <div className="opacity-80 mb-2">{data.symbol.toUpperCase()}</div>
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="opacity-60">Rank:</span>
                  <span>#{data.marketCapRank}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="opacity-60">Price:</span>
                  <span>{formatNumber(data.price)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="opacity-60">24h:</span>
                  <span className={data.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {formatPercentage(data.change)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="opacity-60">MCap:</span>
                  <span>{formatNumber(data.marketCap)}</span>
                </div>
              </div>
            </div>
          </Html>
        )}
        
        {/* Energy field */}
        <mesh scale={[2, 2, 2]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={data.color}
            transparent
            opacity={hovered || isSelected ? 0.3 : 0.1}
            emissive={data.color}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    </Float>
  )
}

const ConstellationLines = ({ nodes }) => {
  const lines = useMemo(() => {
    const connections = []
    const processed = new Set()
    
    nodes.forEach((node, i) => {
      // Connect to nearest neighbors based on market cap similarity
      const neighbors = nodes
        .map((other, j) => ({
          node: other,
          index: j,
          distance: Math.sqrt(
            Math.pow(node.x - other.x, 2) +
            Math.pow(node.y - other.y, 2) +
            Math.pow(node.z - other.z, 2)
          ),
          marketCapDiff: Math.abs(Math.log(node.marketCap) - Math.log(other.marketCap))
        }))
        .filter(({ index, marketCapDiff }) => 
          index !== i && 
          !processed.has(`${Math.min(i, index)}-${Math.max(i, index)}`) &&
          marketCapDiff < 1.5
        )
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
      
      neighbors.forEach(({ node: otherNode, index: j }) => {
        const key = `${Math.min(i, j)}-${Math.max(i, j)}`
        if (!processed.has(key)) {
          processed.add(key)
          connections.push([
            new THREE.Vector3(node.x, node.y, node.z),
            new THREE.Vector3(otherNode.x, otherNode.y, otherNode.z)
          ])
        }
      })
    })
    
    return connections
  }, [nodes])
  
  return (
    <>
      {lines.map((points, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            color="#ffffff" 
            opacity={0.15} 
            transparent 
            linewidth={1}
            linecap="round"
            linejoin="round"
          />
        </line>
      ))}
    </>
  )
}

const CryptoConstellation = () => {
  const { cryptoData, setSelectedCrypto, selectedCrypto } = useStore()
  const [showInfo, setShowInfo] = useState(true)
  const constellationData = useMemo(() => {
    return dataToConstellation(cryptoData).map((node, index) => ({
      ...node,
      marketCapRank: index + 1
    }))
  }, [cryptoData])
  
  return (
    <div className="w-full h-screen relative">
      <Canvas camera={{ position: [0, 5, 25], fov: 60 }}>
        <color attach="background" args={['#000814']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#667eea" />
        <pointLight position={[0, 20, 0]} intensity={0.3} color="#ec4899" />
        
        {/* Background stars */}
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1} 
        />
        
        <group>
          {constellationData.map((data) => (
            <CryptoNode
              key={data.id}
              data={data}
              onClick={setSelectedCrypto}
              selectedId={selectedCrypto?.id}
            />
          ))}
          <ConstellationLines nodes={constellationData} />
        </group>
        
        {/* Central energy core */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#667eea"
            emissive="#667eea"
            emissiveIntensity={1}
            transparent
            opacity={0.3}
          />
        </mesh>
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.3}
          maxDistance={50}
          minDistance={5}
        />
        
        <fog attach="fog" args={['#000814', 20, 60]} />
      </Canvas>
      
      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="absolute top-8 left-8 glass rounded-2xl p-6 max-w-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-glow">Crypto Galaxy</h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm opacity-80">
                Explore the cryptocurrency universe in 3D. Each star represents a cryptocurrency, 
                with relationships based on market dynamics.
              </p>
              
              {/* Visual Legend */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Visual Guide</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-green-600"></div>
                    <span>Rising (Gains)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-red-600"></div>
                    <span>Falling (Losses)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/20"></div>
                    <span>Large Cap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/20"></div>
                    <span>Small Cap</span>
                  </div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Navigation</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-white/10">
                      <Move3d size={16} />
                    </div>
                    <span>Click & drag to rotate</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-white/10">
                      <ZoomIn size={16} />
                    </div>
                    <span>Scroll to zoom in/out</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-white/10">
                      <RotateCw size={16} />
                    </div>
                    <span>Auto-rotating view</span>
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="border-t border-white/10 pt-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="opacity-60">Coins Shown:</span>
                    <span className="ml-2 font-semibold">{constellationData.length}</span>
                  </div>
                  <div>
                    <span className="opacity-60">Connections:</span>
                    <span className="ml-2 font-semibold">Dynamic</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toggle Info Button */}
      {!showInfo && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowInfo(true)}
          className="absolute top-8 left-8 glass rounded-full p-3 hover:bg-white/20 transition-colors"
        >
          <Info size={20} />
        </motion.button>
      )}
      
      {/* Selected Crypto Detail Panel */}
      <AnimatePresence>
        {selectedCrypto && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 glass rounded-2xl p-6 max-w-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedCrypto.image} 
                  alt={selectedCrypto.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-bold">{selectedCrypto.name}</h3>
                  <p className="text-sm opacity-70">{selectedCrypto.symbol?.toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCrypto(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs opacity-60">Price</p>
                <p className="text-lg font-semibold">{formatNumber(selectedCrypto.current_price)}</p>
              </div>
              <div>
                <p className="text-xs opacity-60">24h Change</p>
                <p className={`text-lg font-semibold ${selectedCrypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercentage(selectedCrypto.price_change_percentage_24h)}
                </p>
              </div>
              <div>
                <p className="text-xs opacity-60">Market Cap</p>
                <p className="text-lg font-semibold">{formatNumber(selectedCrypto.market_cap)}</p>
              </div>
              <div>
                <p className="text-xs opacity-60">Volume 24h</p>
                <p className="text-lg font-semibold">{formatNumber(selectedCrypto.total_volume)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CryptoConstellation 