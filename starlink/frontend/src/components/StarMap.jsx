import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Html } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useRef, useMemo, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import useStore from '../store.js'

// ─── Star Instances ───────────────────────────────────────────────────────────

function StarInstances() {
  const users = useStore(s => s.users)
  const hoveredUserId = useStore(s => s.hoveredUserId)
  const setHovered = useStore(s => s.setHovered)
  const selectUser = useStore(s => s.selectUser)
  const selectedUser = useStore(s => s.selectedUser)

  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Set initial matrices and colors
  useEffect(() => {
    if (!meshRef.current || users.length === 0) return
    const color = new THREE.Color()
    users.forEach((u, i) => {
      const scale = (u.star_brightness || 1) * 8
      dummy.position.set(u.position_x || 0, u.position_y || 0, u.position_z || 0)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      color.set(u.avatar_color || '#7c4dff')
      meshRef.current.setColorAt(i, color)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }, [users, dummy])

  // Animate hovered / selected star pulsing
  useFrame(({ clock }) => {
    if (!meshRef.current || users.length === 0) return
    const t = clock.getElapsedTime()

    users.forEach((u, i) => {
      const baseScale = (u.star_brightness || 1) * 8
      let scale = baseScale

      if (u.id === hoveredUserId) {
        scale = baseScale * (1.3 + Math.sin(t * 6) * 0.2)
      } else if (selectedUser && u.id === selectedUser.id) {
        scale = baseScale * (1.2 + Math.sin(t * 3) * 0.1)
      }

      dummy.position.set(u.position_x || 0, u.position_y || 0, u.position_z || 0)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation()
    const idx = e.instanceId
    if (idx !== undefined && users[idx]) {
      setHovered(users[idx].id)
      document.body.style.cursor = 'pointer'
    }
  }, [users, setHovered])

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation()
    setHovered(null)
    document.body.style.cursor = 'default'
  }, [setHovered])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    const idx = e.instanceId
    if (idx !== undefined && users[idx]) {
      selectUser(users[idx])
    }
  }, [users, selectUser])

  if (users.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, users.length]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        vertexColors
        toneMapped={false}
      />
    </instancedMesh>
  )
}

// ─── Star Labels (Html overlays for hovered star) ─────────────────────────────

function StarLabels() {
  const users = useStore(s => s.users)
  const hoveredUserId = useStore(s => s.hoveredUserId)

  const hoveredUser = useMemo(
    () => users.find(u => u.id === hoveredUserId) || null,
    [users, hoveredUserId]
  )

  if (!hoveredUser) return null

  return (
    <Html
      position={[
        hoveredUser.position_x || 0,
        (hoveredUser.position_y || 0) + (hoveredUser.star_brightness || 1) * 10 + 12,
        hoveredUser.position_z || 0
      ]}
      center
      style={{ pointerEvents: 'none' }}
    >
      <div
        style={{
          background: 'rgba(15,15,35,0.92)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8,
          padding: '6px 12px',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(8px)'
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: hoveredUser.avatar_color || '#7c4dff',
            marginRight: 6,
            verticalAlign: 'middle'
          }}
        />
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            color: '#ffffff'
          }}
        >
          {hoveredUser.name}
        </span>
      </div>
    </Html>
  )
}

// ─── Connection Lines ──────────────────────────────────────────────────────────

function ConnectionLines() {
  const connections = useStore(s => s.connections)
  const users = useStore(s => s.users)
  const filterMode = useStore(s => s.filterMode)
  const selectedUser = useStore(s => s.selectedUser)
  const userConnections = useStore(s => s.userConnections)

  const userMap = useMemo(() => {
    const map = new Map()
    users.forEach(u => map.set(u.id, u))
    return map
  }, [users])

  // Determine which connections to show
  const visibleConnections = useMemo(() => {
    let pool = connections

    if (selectedUser) {
      // Show connections for selected user
      const ucIds = new Set(userConnections.map(c => c.id))
      pool = connections.filter(c =>
        c.user_a_id === selectedUser.id ||
        c.user_b_id === selectedUser.id ||
        ucIds.has(c.id)
      )
    } else {
      // Default: only strong connections
      pool = connections.filter(c => (c.score || 0) >= 5)
    }

    // Apply filter mode
    if (filterMode === 'interest') {
      pool = pool.filter(c => c.shared_likes && c.shared_likes.length > 0)
    } else if (filterMode === 'dislike') {
      pool = pool.filter(c => c.shared_dislikes && c.shared_dislikes.length > 0)
    } else if (filterMode === 'skill') {
      pool = pool.filter(c => c.skill_match)
    }

    // Cap at 300
    return pool.slice(0, 300)
  }, [connections, filterMode, selectedUser, userConnections])

  // Compute line data
  const lineData = useMemo(() => {
    return visibleConnections.map((conn, idx) => {
      const userA = userMap.get(conn.user_a_id)
      const userB = userMap.get(conn.user_b_id)
      if (!userA || !userB) return null

      const posA = [userA.position_x || 0, userA.position_y || 0, userA.position_z || 0]
      const posB = [userB.position_x || 0, userB.position_y || 0, userB.position_z || 0]

      // Determine color
      let color = '#4fc3f7'
      if (conn.skill_match && (conn.shared_likes?.length > 0 || conn.shared_dislikes?.length > 0)) {
        color = '#ffd54f'
      } else if (conn.skill_match) {
        color = '#ffd54f'
      } else if (conn.shared_likes?.length > 0) {
        color = '#4fc3f7'
      } else if (conn.shared_dislikes?.length > 0) {
        color = '#ff8a65'
      }

      // Highlight if involves selected user
      const isSelected = selectedUser &&
        (conn.user_a_id === selectedUser.id || conn.user_b_id === selectedUser.id)

      return {
        id: conn.id,
        posA,
        posB,
        color,
        phase: idx * 0.37,
        isSelected,
        score: conn.score || 0
      }
    }).filter(Boolean)
  }, [visibleConnections, userMap, selectedUser])

  return (
    <>
      {lineData.map(line => (
        <AnimatedLine key={line.id} {...line} />
      ))}
    </>
  )
}

function AnimatedLine({ posA, posB, color, phase, isSelected, score }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const baseOpacity = isSelected ? 0.85 : Math.max(0.15, (score / 10) * 0.6)
    ref.current.material.opacity = baseOpacity + Math.sin(t * 1.2 + phase) * 0.15
  })

  return (
    <line ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array([...posA, ...posB]), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={isSelected ? 0.85 : 0.35}
        linewidth={isSelected ? 2 : 1}
        toneMapped={false}
      />
    </line>
  )
}

// ─── Main StarMap ──────────────────────────────────────────────────────────────

export default function StarMap() {
  const users = useStore(s => s.users)
  const isLoading = useStore(s => s.isLoading)
  const clearSelection = useStore(s => s.clearSelection)

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: '#0a0a1a'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 800], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0a1a')
        }}
      >
        <color attach="background" args={['#0a0a1a']} />
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#7c4dff" />

        {/* Background star particles */}
        <Stars
          radius={1500}
          depth={100}
          count={3000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        {!isLoading && users.length > 0 && (
          <>
            <StarInstances />
            <StarLabels />
            <ConnectionLines />
          </>
        )}

        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={50}
          maxDistance={1200}
          autoRotate={true}
          autoRotateSpeed={0.3}
          makeDefault
        />
      </Canvas>

      {/* Click backdrop to deselect */}
      {/* Handled by the 3D scene's background click */}
    </div>
  )
}
