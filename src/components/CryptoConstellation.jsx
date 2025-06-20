import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../utils/store'
import { dataToConstellation } from '../utils/helpers'

const CryptoNode = ({ data, onClick }) => {
  const meshRef = useRef()
  const [hovered, setHovered] = React.useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1)
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
    }
  })
  
  return (
    <group position={[data.x, data.y, data.z]}>
      <mesh
        ref={meshRef}
        onClick={() => onClick(data)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={data.size}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {hovered && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {data.symbol.toUpperCase()}
        </Text>
      )}
    </group>
  )
}

const ConstellationLines = ({ nodes }) => {
  const lines = useMemo(() => {
    const connections = []
    nodes.forEach((node, i) => {
      nodes.slice(i + 1).forEach((otherNode) => {
        const distance = Math.sqrt(
          Math.pow(node.x - otherNode.x, 2) +
          Math.pow(node.y - otherNode.y, 2) +
          Math.pow(node.z - otherNode.z, 2)
        )
        if (distance < 3) {
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
          <lineBasicMaterial color="#ffffff" opacity={0.1} transparent />
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
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#667eea" />
        
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
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
        
        <fog attach="fog" args={['#000000', 10, 50]} />
      </Canvas>
      
      <div className="absolute top-8 left-8 glass rounded-2xl p-6 max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-glow">Crypto Constellation</h2>
        <p className="text-sm opacity-70">
          Each star represents a cryptocurrency. Size indicates market cap, 
          color shows 24h price change, and position reflects market relationships.
        </p>
      </div>
    </div>
  )
}

export default CryptoConstellation 