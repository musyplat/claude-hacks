import { useState, useMemo } from 'react'
import useStore from '../store.js'

// Deterministic-ish fake timestamps based on user id hash
const TIMESTAMPS = ['just now', '2m ago', '5m ago', '12m ago', '18m ago', '1h ago', '2h ago']
function fakeTimestamp(seed) {
  const n = (typeof seed === 'string'
    ? seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    : seed || 0)
  return TIMESTAMPS[n % TIMESTAMPS.length]
}

function SkillPill({ label, type }) {
  const bg = type === 'offer'
    ? 'rgba(13,71,161,0.55)'
    : 'rgba(230,81,0,0.5)'
  const color = type === 'offer' ? '#90caf9' : '#ffe082'
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      background: bg,
      color,
      fontSize: 11,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      marginRight: 4,
      marginBottom: 4,
      lineHeight: 1.6
    }}>
      {label}
    </span>
  )
}

function RequestCard({ user, mode, connection, onConnect }) {
  const [hovered, setHovered] = useState(false)

  const skills_need = Array.isArray(user.skills_need) ? user.skills_need : []
  const skills_offer = Array.isArray(user.skills_offer) ? user.skills_offer : []
  const likes = Array.isArray(user.likes) ? user.likes : []
  const dislikes = Array.isArray(user.dislikes) ? user.dislikes : []

  const sharedLikes = connection?.shared_likes || []
  const sharedDislikes = connection?.shared_dislikes || []
  const hasShared = sharedLikes.length > 0 || sharedDislikes.length > 0
  const isSkillMatch = connection?.skill_match === true

  // Primary skill shown in headline
  const primarySkill = mode === 'need'
    ? (skills_need[0] || '')
    : (skills_offer[0] || '')

  // Secondary skills (rest)
  const secondaryNeeds = skills_need.slice(mode === 'need' ? 1 : 0)
  const secondaryOffers = skills_offer.slice(mode === 'offer' ? 1 : 0)

  const ts = fakeTimestamp(user.id)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(15,15,40,0.7)',
        border: `1px solid ${hovered ? 'rgba(124,77,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 12,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: hovered ? '0 0 24px rgba(124,77,255,0.12)' : 'none',
        cursor: 'default'
      }}
    >
      {/* Top row: avatar dot + name + timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: user.avatar_color || '#7c4dff',
            boxShadow: `0 0 8px ${user.avatar_color || '#7c4dff'}`,
            flexShrink: 0
          }} />
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 15,
            fontWeight: 600,
            color: '#ffffff'
          }}>
            {user.name}
          </span>
          {isSkillMatch && (
            <span style={{
              fontSize: 11,
              background: 'rgba(255,213,79,0.18)',
              color: '#ffd54f',
              padding: '2px 8px',
              borderRadius: 4,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              animation: 'skillPulse 2.4s ease-in-out infinite'
            }}>
              ⚡ Skill match!
            </span>
          )}
        </div>
        <span style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'Inter, sans-serif',
          flexShrink: 0
        }}>
          {ts}
        </span>
      </div>

      {/* Primary request line */}
      {primarySkill && (
        <div style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.8)',
          fontFamily: 'Inter, sans-serif',
          marginBottom: 8,
          lineHeight: 1.5
        }}>
          {mode === 'need'
            ? <><span style={{ color: '#ffe082' }}>🙋 Needs:</span> {primarySkill}</>
            : <><span style={{ color: '#90caf9' }}>🎁 Offers:</span> {primarySkill}</>
          }
        </div>
      )}

      {/* Secondary skills row */}
      {(secondaryOffers.length > 0 || secondaryNeeds.length > 0) && (
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', marginRight: 6 }}>
            Also {mode === 'need' ? 'offers' : 'needs'}:
          </span>
          {(mode === 'need' ? secondaryOffers : secondaryNeeds).slice(0, 3).map((s, i) => (
            <SkillPill key={i} label={s} type={mode === 'need' ? 'offer' : 'need'} />
          ))}
        </div>
      )}

      {/* Shared interests */}
      {hasShared && (
        <div style={{ marginBottom: 10, fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif' }}>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>Shared with you: </span>
          {sharedLikes.slice(0, 2).map((l, i) => (
            <span key={`l-${i}`} style={{ marginRight: 6 }}>
              <span style={{ color: '#a5d6a7' }}>❤️</span>{' '}
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>{l}</span>
            </span>
          ))}
          {sharedDislikes.slice(0, 2).map((d, i) => (
            <span key={`d-${i}`} style={{ marginRight: 6 }}>
              <span style={{ color: '#ef9a9a' }}>💔</span>{' '}
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>{d}</span>
            </span>
          ))}
        </div>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <button
          onClick={() => onConnect(user)}
          style={{
            padding: '6px 16px',
            background: 'rgba(124,77,255,0.2)',
            border: '1px solid rgba(124,77,255,0.35)',
            borderRadius: 7,
            color: '#c5b3ff',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(124,77,255,0.35)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(124,77,255,0.2)'
            e.currentTarget.style.color = '#c5b3ff'
          }}
        >
          Connect
        </button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '64px 24px',
      color: 'rgba(255,255,255,0.35)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
      <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0 }}>
        No requests yet in this community.
        <br />
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>Be the first — add your star above.</span>
      </p>
    </div>
  )
}

const TABS = [
  { id: 'need', label: 'Need Help', icon: '🙋' },
  { id: 'offer', label: 'Offering Help', icon: '🎁' },
  { id: 'exchange', label: 'Exchanges', icon: '⚡' }
]

export default function RequestFeed() {
  const users = useStore(s => s.users)
  const connections = useStore(s => s.connections)
  const selectUser = useStore(s => s.selectUser)

  const [activeTab, setActiveTab] = useState('need')
  const [search, setSearch] = useState('')

  // Build a lookup: for each user pair, find their connection
  const connectionMap = useMemo(() => {
    const map = {}
    connections.forEach(conn => {
      const key = [conn.user_a_id, conn.user_b_id].sort().join(':')
      map[key] = conn
    })
    return map
  }, [connections])

  // Helper to find connection between any two users
  function getConnection(userId) {
    // Look for any connection involving this user
    return connections.find(c => c.user_a_id === userId || c.user_b_id === userId) || null
  }

  // Build feed cards from all users
  const allCards = useMemo(() => {
    return users.flatMap(user => {
      const skills_need = Array.isArray(user.skills_need) ? user.skills_need : []
      const skills_offer = Array.isArray(user.skills_offer) ? user.skills_offer : []
      const connection = getConnection(user.id)
      const isSkillMatch = connection?.skill_match === true
      const sharedCount = (connection?.shared_likes?.length || 0) + (connection?.shared_dislikes?.length || 0)
      const score = connection?.score || 0

      const cards = []
      if (skills_need.length > 0) {
        cards.push({ user, mode: 'need', connection, isSkillMatch, sharedCount, score })
      }
      if (skills_offer.length > 0) {
        cards.push({ user, mode: 'offer', connection, isSkillMatch, sharedCount, score })
      }
      return cards
    })
  }, [users, connections])

  // Tab counts
  const needCount = allCards.filter(c => c.mode === 'need').length
  const offerCount = allCards.filter(c => c.mode === 'offer').length
  const exchangeCount = allCards.filter(c => c.isSkillMatch).length

  // Filter by tab
  const tabFiltered = useMemo(() => {
    if (activeTab === 'need') return allCards.filter(c => c.mode === 'need')
    if (activeTab === 'offer') return allCards.filter(c => c.mode === 'offer')
    return allCards.filter(c => c.isSkillMatch)
  }, [allCards, activeTab])

  // Filter by search
  const searchFiltered = useMemo(() => {
    if (!search.trim()) return tabFiltered
    const q = search.toLowerCase()
    return tabFiltered.filter(({ user }) => {
      const skills = [
        ...(user.skills_need || []),
        ...(user.skills_offer || [])
      ]
      return (
        user.name?.toLowerCase().includes(q) ||
        skills.some(s => s.toLowerCase().includes(q))
      )
    })
  }, [tabFiltered, search])

  // Sort: skill matches first, then by score, then by sharedCount
  const sorted = useMemo(() => {
    return [...searchFiltered].sort((a, b) => {
      if (a.isSkillMatch !== b.isSkillMatch) return a.isSkillMatch ? -1 : 1
      if (b.score !== a.score) return b.score - a.score
      return b.sharedCount - a.sharedCount
    })
  }, [searchFiltered])

  const tabCounts = { need: needCount, offer: offerCount, exchange: exchangeCount }

  return (
    <div style={{
      width: '100%',
      minHeight: 'calc(100vh - 48px)',
      background: 'radial-gradient(ellipse at 30% 20%, rgba(124,77,255,0.06) 0%, transparent 60%), #0a0a1a',
      overflowY: 'auto',
      paddingTop: 24,
      paddingBottom: 48
    }}>
      <div style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Search bar */}
        <div style={{
          position: 'relative',
          marginBottom: 18
        }}>
          <span style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 15,
            pointerEvents: 'none',
            color: 'rgba(255,255,255,0.3)'
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search skills, names..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '11px 16px 11px 42px',
              background: 'rgba(15,15,40,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              color: '#ffffff',
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,77,255,0.5)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: 22,
          background: 'rgba(15,15,35,0.6)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10,
          padding: 5
        }}>
          {TABS.map(tab => {
            const count = tab.id === 'need' ? needCount : tab.id === 'offer' ? offerCount : exchangeCount
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: isActive ? 'rgba(124,77,255,0.22)' : 'transparent',
                  border: isActive ? '1px solid rgba(124,77,255,0.35)' : '1px solid transparent',
                  borderRadius: 7,
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.45)',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                  }
                }}
              >
                <span style={{ fontSize: 14 }}>{tab.icon}</span>
                {tab.label}
                <span style={{
                  fontSize: 11,
                  background: isActive ? 'rgba(124,77,255,0.35)' : 'rgba(255,255,255,0.1)',
                  color: isActive ? '#c5b3ff' : 'rgba(255,255,255,0.4)',
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontWeight: 600,
                  minWidth: 22,
                  textAlign: 'center'
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Cards */}
        {sorted.length === 0
          ? <EmptyState />
          : sorted.map((item, i) => (
            <RequestCard
              key={`${item.user.id}-${item.mode}-${i}`}
              user={item.user}
              mode={item.mode}
              connection={item.connection}
              onConnect={selectUser}
            />
          ))
        }
      </div>

      <style>{`
        @keyframes skillPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(255,213,79,0.3); }
          50% { opacity: 0.8; box-shadow: 0 0 0 4px rgba(255,213,79,0); }
        }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  )
}
