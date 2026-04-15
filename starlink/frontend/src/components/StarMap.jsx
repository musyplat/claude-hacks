import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Html, Line } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useRef, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import useStore from '../store.js'

// ─── Glow texture factory ─────────────────────────────────────────────────────

function createGlowTexture(hexColor) {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const half = size / 2

  // Parse hex to rgb
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)

  // Outer soft halo
  const halo = ctx.createRadialGradient(half, half, 0, half, half, half)
  halo.addColorStop(0,   `rgba(${r},${g},${b},1.0)`)
  halo.addColorStop(0.12, `rgba(${r},${g},${b},0.95)`)
  halo.addColorStop(0.35, `rgba(${r},${g},${b},0.5)`)
  halo.addColorStop(0.65, `rgba(${r},${g},${b},0.12)`)
  halo.addColorStop(1,   `rgba(${r},${g},${b},0.0)`)
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, size, size)

  // Bright white core
  const core = ctx.createRadialGradient(half, half, 0, half, half, half * 0.18)
  core.addColorStop(0,   'rgba(255,255,255,1.0)')
  core.addColorStop(0.5, 'rgba(255,255,255,0.6)')
  core.addColorStop(1,   'rgba(255,255,255,0.0)')
  ctx.fillStyle = core
  ctx.fillRect(0, 0, size, size)

  return new THREE.CanvasTexture(canvas)
}

// ─── Individual glowing star sprite ──────────────────────────────────────────

function GlowStar({ user }) {
  const spriteRef = useRef()
  const setHovered  = useStore(s => s.setHovered)
  const selectUser  = useStore(s => s.selectUser)
  const hoveredUserId = useStore(s => s.hoveredUserId)
  const selectedUser  = useStore(s => s.selectedUser)

  const texture = useMemo(
    () => createGlowTexture(user.avatar_color || '#7c4dff'),
    [user.avatar_color]
  )

  const isHovered  = hoveredUserId === user.id
  const isSelected = selectedUser?.id === user.id
  const baseSize   = (user.star_brightness || 1) * 28 + 14

  useFrame(({ clock }) => {
    if (!spriteRef.current) return
    const t = clock.getElapsedTime()
    // Gentle breathing pulse on all stars, faster on active ones
    const pulse = isHovered
      ? 1.4 + Math.sin(t * 7) * 0.25
      : isSelected
      ? 1.25 + Math.sin(t * 3) * 0.15
      : 1.0  + Math.sin(t * 1.2 + user.position_x * 0.01) * 0.06
    const s = baseSize * pulse
    spriteRef.current.scale.set(s, s, 1)
  })

  const onOver = useCallback((e) => {
    e.stopPropagation()
    setHovered(user.id)
    document.body.style.cursor = 'pointer'
  }, [user.id, setHovered])

  const onOut = useCallback((e) => {
    e.stopPropagation()
    setHovered(null)
    document.body.style.cursor = 'default'
  }, [setHovered])

  const onClick = useCallback((e) => {
    e.stopPropagation()
    selectUser(user)
  }, [user, selectUser])

  return (
    <>
      <sprite
        ref={spriteRef}
        position={[user.position_x || 0, user.position_y || 0, user.position_z || 0]}
        scale={[baseSize, baseSize, 1]}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      >
        <spriteMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
      </sprite>

      {/* Hover label */}
      {isHovered && (
        <Html
          position={[
            user.position_x || 0,
            (user.position_y || 0) + baseSize * 0.6 + 10,
            user.position_z || 0
          ]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            background: 'rgba(10,10,26,0.88)',
            border: `1px solid ${user.avatar_color || '#7c4dff'}55`,
            borderRadius: 8,
            padding: '5px 12px',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(10px)',
            boxShadow: `0 0 12px ${user.avatar_color || '#7c4dff'}44`
          }}>
            <span style={{
              display: 'inline-block',
              width: 7, height: 7,
              borderRadius: '50%',
              background: user.avatar_color || '#7c4dff',
              marginRight: 7,
              verticalAlign: 'middle',
              boxShadow: `0 0 6px ${user.avatar_color || '#7c4dff'}`
            }} />
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 500,
              color: '#ffffff',
              letterSpacing: '0.02em'
            }}>
              {user.name}
            </span>
          </div>
        </Html>
      )}
    </>
  )
}

// ─── Connection Lines ──────────────────────────────────────────────────────────

function AnimatedLine({
  id, posA, posB, color, phase, isSelected, score,
  midpoint, sharedLikes, sharedDislikes, skillMatch, userAName, userBName
}) {
  const lineRef = useRef()
  const hoveredLineId  = useStore(s => s.hoveredLineId)
  const setHoveredLine = useStore(s => s.setHoveredLine)

  const isThisHovered   = hoveredLineId === id
  const isOtherHovered  = hoveredLineId !== null && hoveredLineId !== id

  useFrame(({ clock }) => {
    if (!lineRef.current) return
    const t = clock.getElapsedTime()

    let opacity
    if (isOtherHovered) {
      opacity = 0.05
    } else if (isThisHovered) {
      opacity = 0.95
    } else {
      const base = isSelected ? 0.75 : Math.max(0.25, (score / 12) * 0.5)
      opacity = base + Math.sin(t * 0.9 + phase) * 0.08
    }

    if (lineRef.current.material) {
      lineRef.current.material.opacity = opacity
    }
  })

  const onPointerOver = useCallback((e) => {
    e.stopPropagation()
    setHoveredLine(id)
    document.body.style.cursor = 'pointer'
  }, [id, setHoveredLine])

  const onPointerOut = useCallback((e) => {
    e.stopPropagation()
    setHoveredLine(null)
    document.body.style.cursor = 'default'
  }, [setHoveredLine])

  return (
    <>
      <Line
        ref={lineRef}
        points={[posA, posB]}
        color={color}
        lineWidth={isThisHovered ? 3.0 : isSelected ? 1.8 : 1.2}
        transparent
        opacity={isThisHovered ? 1.0 : isSelected ? 0.75 : 0.35}
        toneMapped={false}
        depthWrite={false}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />

      {isThisHovered && midpoint && (
        <Html position={midpoint} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(10,10,26,0.92)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            padding: '8px 14px',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(10px)',
            fontSize: 12,
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            minWidth: 160,
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{userAName} ↔ {userBName}</div>
            {sharedLikes.length > 0 && (
              <div style={{ color: '#a5d6a7' }}>❤️ {sharedLikes.join(', ')}</div>
            )}
            {sharedDislikes.length > 0 && (
              <div style={{ color: '#ef9a9a' }}>💔 {sharedDislikes.join(', ')}</div>
            )}
            {skillMatch && (
              <div style={{ color: '#ffd54f' }}>⚡ Skill exchange possible</div>
            )}
          </div>
        </Html>
      )}
    </>
  )
}

function ConnectionLines() {
  const connections   = useStore(s => s.connections)
  const users         = useStore(s => s.users)
  const filterMode    = useStore(s => s.filterMode)
  const selectedUser  = useStore(s => s.selectedUser)
  const userConnections = useStore(s => s.userConnections)

  const userMap = useMemo(() => {
    const map = new Map()
    users.forEach(u => map.set(u.id, u))
    return map
  }, [users])

  const visibleConnections = useMemo(() => {
    let pool

    if (selectedUser) {
      const ucIds = new Set(userConnections.map(c => c.id))
      pool = connections.filter(c =>
        c.user_a_id === selectedUser.id ||
        c.user_b_id === selectedUser.id ||
        ucIds.has(c.id)
      )
    } else {
      // Default: show all connections, sorted by strength
      pool = connections
        .filter(c => (c.score || 0) >= 2)
        .sort((a, b) => b.score - a.score)
        .slice(0, 150)
    }

    if (filterMode === 'interest') pool = pool.filter(c => c.shared_likes?.length > 0)
    else if (filterMode === 'dislike') pool = pool.filter(c => c.shared_dislikes?.length > 0)
    else if (filterMode === 'skill') pool = pool.filter(c => c.skill_match)

    return pool
  }, [connections, filterMode, selectedUser, userConnections])

  const lineData = useMemo(() => {
    return visibleConnections.map((conn, idx) => {
      const userA = userMap.get(conn.user_a_id)
      const userB = userMap.get(conn.user_b_id)
      if (!userA || !userB) return null

      const posA = [userA.position_x || 0, userA.position_y || 0, userA.position_z || 0]
      const posB = [userB.position_x || 0, userB.position_y || 0, userB.position_z || 0]

      // When a filter is active, force the color to match what's being filtered
      let color
      if (filterMode === 'dislike') {
        color = '#e07055'
      } else if (filterMode === 'interest') {
        color = '#4fc3f7'
      } else if (filterMode === 'skill') {
        color = '#c8a84b'
      } else {
        // Default: color by the strongest signal in this connection
        if (conn.skill_match && !conn.shared_likes?.length && !conn.shared_dislikes?.length) {
          color = '#c8a84b'
        } else if (conn.shared_dislikes?.length > 0 && !conn.shared_likes?.length) {
          color = '#e07055'
        } else {
          color = '#4fc3f7'
        }
      }

      const isSelected = selectedUser &&
        (conn.user_a_id === selectedUser.id || conn.user_b_id === selectedUser.id)

      const midpoint = [
        (posA[0] + posB[0]) / 2,
        (posA[1] + posB[1]) / 2,
        (posA[2] + posB[2]) / 2
      ]

      return {
        id: conn.id,
        posA,
        posB,
        color,
        phase: idx * 0.41,
        isSelected,
        score: conn.score || 0,
        midpoint,
        sharedLikes: conn.shared_likes || [],
        sharedDislikes: conn.shared_dislikes || [],
        skillMatch: conn.skill_match || false,
        userAName: userA.name,
        userBName: userB.name
      }
    }).filter(Boolean)
  }, [visibleConnections, userMap, selectedUser, filterMode])

  return (
    <>
      {lineData.map(line => (
        <AnimatedLine key={line.id} {...line} />
      ))}
    </>
  )
}

// ─── Stars layer ──────────────────────────────────────────────────────────────

function AllStars() {
  const users = useStore(s => s.users)
  return (
    <>
      {users.map(u => <GlowStar key={u.id} user={u} />)}
    </>
  )
}

// ─── Main StarMap ──────────────────────────────────────────────────────────────

export default function StarMap() {
  const users     = useStore(s => s.users)
  const isLoading = useStore(s => s.isLoading)

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#060610' }}>
      <Canvas
        camera={{ position: [0, 0, 700], fov: 55, far: 8000 }}
        gl={{ antialias: true, alpha: false }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        onCreated={({ gl }) => gl.setClearColor('#060610')}
      >
        <color attach="background" args={['#060610']} />

        {/* Deep space background particles */}
        <Stars radius={1800} depth={120} count={4000} factor={3} saturation={0.1} fade speed={0.3} />

        {!isLoading && users.length > 0 && (
          <>
            <AllStars />
            <ConnectionLines />
          </>
        )}

        <EffectComposer>
          <Bloom
            intensity={2.2}
            luminanceThreshold={0.05}
            luminanceSmoothing={0.85}
            mipmapBlur
            radius={0.8}
          />
        </EffectComposer>

        <OrbitControls
          enablePan
          enableZoom
          minDistance={80}
          maxDistance={1400}
          autoRotate
          autoRotateSpeed={0.25}
          makeDefault
        />
      </Canvas>
    </div>
  )
}
