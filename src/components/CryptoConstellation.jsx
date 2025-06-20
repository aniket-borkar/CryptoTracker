import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Text, Trail, Float, Stars } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../utils/store'
import { dataToConstellation, formatNumber, formatPercentage } from '../utils/helpers'

const CryptoNode = ({ data, onClick }) => {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      
      // Pulsating effect based on volume
      const pulseFactor = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      
      if (hovered) {
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
              emissiveIntensity={hovered ? 0.8 : 0.5}
              metalness={0.8}
              roughness={0.2}
              wireframe={clicked}
            />
          </mesh>
        </Trail>
        {hovered && (
          <>
            <Text
              position={[0, 2, 0]}
              fontSize={0.5}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.05}
              outlineColor={data.color}
            >
              {data.symbol.toUpperCase()}
            </Text>
            <Text
              position={[0, 1.5, 0]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {formatNumber(data.price)}
            </Text>
            <Text
              position={[0, 1, 0]}
              fontSize={0.25}
              color={data.change >= 0 ? '#00ff88' : '#ff4444'}
              anchorX="center"
              anchorY="middle"
            >
              {formatPercentage(data.change)}
            </Text>
          </>
        )}
        {/* Energy field */}
        <mesh scale={[2, 2, 2]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={data.color}
            transparent
            opacity={hovered ? 0.3 : 0.1}
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
  const { cryptoData, setSelectedCrypto } = useStore()
  const constellationData = useMemo(() => dataToConstellation(cryptoData), [cryptoData])
  
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
      
      <div className="absolute top-8 left-8 glass rounded-2xl p-6 max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-glow">Crypto Galaxy</h2>
        <p className="text-sm opacity-70">
          Navigate through the cryptocurrency universe. Each star represents a coin, 
          with size showing market cap and position indicating market relationships.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Rising</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span>Falling</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span>Stable</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CryptoConstellation 