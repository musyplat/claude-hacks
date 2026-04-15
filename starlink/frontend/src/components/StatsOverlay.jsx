import { useEffect } from 'react'
import useStore from '../store.js'

export default function StatsOverlay() {
  const stats = useStore(s => s.stats)
  const users = useStore(s => s.users)
  const connections = useStore(s => s.connections)

  const starCount = stats?.user_count ?? users.length
  const connCount = stats?.connection_count ?? connections.length
  const exchangeCount = stats?.exchange_count ?? 0

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        left: 24,
        zIndex: 40,
        pointerEvents: 'none'
      }}
    >
      {/* Logo / brand mark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10
        }}
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 0L9.2 5.8L15 8L9.2 10.2L8 16L6.8 10.2L1 8L6.8 5.8L8 0Z"
            fill="#7c4dff"
          />
        </svg>
        <span
          className="font-space"
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.01em'
          }}
        >
          StarLink
        </span>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: 'rgba(255,255,255,0.45)',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <Stat value={starCount} label="stars" />
        <Dot />
        <Stat value={connCount} label="connections" />
        <Dot />
        <Stat value={exchangeCount} label="exchanges today" />
      </div>

      {/* Live indicator */}
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#4caf50',
            animation: 'pulse 2s infinite'
          }}
        />
        <span style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.08em',
          fontFamily: 'Inter, sans-serif'
        }}>
          LIVE
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(76,175,80,0.4); }
          50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(76,175,80,0); }
        }
      `}</style>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <span>
      <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
        {value?.toLocaleString() ?? '—'}
      </span>
      {' '}
      <span style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
    </span>
  )
}

function Dot() {
  return <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
}
