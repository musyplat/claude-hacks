import { useEffect, useRef } from 'react'

function StarfieldCanvas() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const starsRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Generate stars with random properties
    starsRef.current = Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.008 + 0.002,
      baseOpacity: Math.random() * 0.5 + 0.1
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      starsRef.current.forEach(star => {
        const opacity = star.baseOpacity + Math.sin(t * star.speed * 60 + star.phase) * 0.4
        const clampedOpacity = Math.max(0.05, Math.min(1, opacity))

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)

        // Slight color variation: some warm, some cool
        const hue = Math.sin(star.phase) > 0 ? `rgba(200, 220, 255, ${clampedOpacity})` : `rgba(255, 240, 200, ${clampedOpacity})`
        ctx.fillStyle = hue
        ctx.fill()

        // Glow effect for brighter stars
        if (star.r > 1.2) {
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.r * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(180, 200, 255, ${clampedOpacity * 0.15})`
          ctx.fill()
        }
      })

      t++
      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    />
  )
}

export default function Landing({ onEnterMap, onCreateStar }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at 30% 50%, rgba(124,77,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(79,195,247,0.06) 0%, transparent 50%), #0a0a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <StarfieldCanvas />

      {/* Radial glow at center */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,77,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: 680,
          padding: '0 24px'
        }}
      >
        {/* Logo / brand */}
        <div className="fade-in-1" style={{ marginBottom: 32 }}>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(124,77,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 0L9.2 5.8L15 8L9.2 10.2L8 16L6.8 10.2L1 8L6.8 5.8L8 0Z" fill="#7c4dff" />
            </svg>
            StarLink
          </span>
        </div>

        {/* Hero text */}
        <h1
          className="fade-in-2 font-space"
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#ffffff',
            marginBottom: 8,
            letterSpacing: '-0.02em'
          }}
        >
          50,000 people on this campus.
        </h1>

        <p
          className="fade-in-3"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: 'rgba(255,255,255,0.55)',
            marginBottom: 8,
            lineHeight: 1.5
          }}
        >
          You sit in lectures with 300 strangers.
        </p>

        <p
          className="fade-in-3"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(18px, 3vw, 28px)',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.85)',
            marginBottom: 56,
            lineHeight: 1.4
          }}
        >
          What if you could{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #7c4dff 0%, #4fc3f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            see the connections
          </span>
          {' '}you&rsquo;re missing?
        </p>

        {/* CTA buttons */}
        <div
          className="fade-in-4"
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            onClick={onEnterMap}
            style={{
              padding: '14px 36px',
              background: 'linear-gradient(135deg, #7c4dff 0%, #5e35b1 100%)',
              border: 'none',
              borderRadius: 12,
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 30px rgba(124,77,255,0.4), 0 4px 16px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 0 50px rgba(124,77,255,0.6), 0 8px 24px rgba(0,0,0,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 0 30px rgba(124,77,255,0.4), 0 4px 16px rgba(0,0,0,0.3)'
            }}
          >
            Enter the Map
          </button>

          <button
            onClick={onCreateStar}
            style={{
              padding: '14px 36px',
              background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: 12,
              color: 'rgba(255,255,255,0.85)',
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(124,77,255,0.6)'
              e.currentTarget.style.background = 'rgba(124,77,255,0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Create Your Star
          </button>
        </div>

        {/* Subtle hint */}
        <p
          className="fade-in-5"
          style={{
            marginTop: 48,
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.05em'
          }}
        >
          Drag to explore &nbsp;·&nbsp; Click stars to connect &nbsp;·&nbsp; Scroll to zoom
        </p>
      </div>
    </div>
  )
}
