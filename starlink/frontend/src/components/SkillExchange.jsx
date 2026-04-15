import { useState } from 'react'
import useStore from '../store.js'
import { proposeExchange } from '../api.js'
import SafetyPrompt from './SafetyPrompt.jsx'

// ─── Skill badge ──────────────────────────────────────────────────────────────
function SkillBadge({ label, type }) {
  const isOffer = type === 'offer'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        background: isOffer ? 'rgba(21, 101, 192, 0.7)' : 'rgba(230, 81, 0, 0.7)',
        color: isOffer ? '#90caf9' : '#ffe082',
        marginRight: 4,
        marginBottom: 4
      }}
    >
      {label}
    </span>
  )
}

// ─── Single match card ────────────────────────────────────────────────────────
function MatchCard({ match, currentUser }) {
  const [showSafety, setShowSafety] = useState(false)
  const [proposing, setProposing] = useState(false)
  const [location, setLocation] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [success, setSuccess] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const { other, youGive, theyGive } = match

  async function handleConfirm() {
    setSending(true)
    setError(null)
    try {
      const resolvedLocation = location === 'custom' ? customLocation : location
      await proposeExchange({
        proposer_id: currentUser.id,
        receiver_id: other.id,
        proposer_gives: youGive,
        receiver_gives: theyGive,
        location: resolvedLocation || undefined,
        time_slot: timeSlot || undefined
      })
      setSuccess(true)
      setProposing(false)
    } catch (err) {
      setError('Failed to send proposal. Please try again.')
    } finally {
      setSending(false)
    }
  }

  function handleProposeClick() {
    const alreadySeen = sessionStorage.getItem('starlink_safety_shown')
    if (alreadySeen) {
      setProposing(true)
    } else {
      setShowSafety(true)
    }
  }

  function handleSafetyConfirm() {
    sessionStorage.setItem('starlink_safety_shown', '1')
    setShowSafety(false)
    setProposing(true)
  }

  function handleSafetyCancel() {
    setShowSafety(false)
  }

  function handleCancel() {
    setProposing(false)
    setLocation('')
    setCustomLocation('')
    setTimeSlot('')
    setError(null)
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 7,
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s'
  }

  const labelStyle = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 5,
    display: 'block'
  }

  return (
    <div
      style={{
        background: success
          ? 'rgba(46, 125, 50, 0.12)'
          : 'rgba(255,255,255,0.04)',
        border: success
          ? '1px solid rgba(76, 175, 80, 0.5)'
          : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '16px',
        marginBottom: 12,
        transition: 'border-color 0.4s, background 0.4s'
      }}
    >
      {/* Person header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: other.avatar_color || '#7c4dff',
            boxShadow: `0 0 8px ${other.avatar_color || '#7c4dff'}`,
            flexShrink: 0
          }}
        />
        <span
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 15,
            fontWeight: 700,
            color: '#ffffff'
          }}
        >
          {other.name}
        </span>
      </div>

      {/* Their skills */}
      <div style={{ marginBottom: 8 }}>
        <div style={labelStyle}>🎁 Offers</div>
        <div>
          {(other.skills_offer || []).map((s, i) => (
            <SkillBadge key={i} label={s} type="offer" />
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={labelStyle}>🙋 Needs</div>
        <div>
          {(other.skills_need || []).map((s, i) => (
            <SkillBadge key={i} label={s} type="need" />
          ))}
        </div>
      </div>

      {/* Exchange summary */}
      <div
        style={{
          background: 'rgba(124,77,255,0.08)',
          border: '1px solid rgba(124,77,255,0.2)',
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 12
        }}
      >
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
          <span style={{ color: '#90caf9' }}>You give them:</span>{' '}
          <span style={{ color: '#ffffff', fontWeight: 600 }}>{youGive}</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif' }}>
          <span style={{ color: '#ffe082' }}>They give you:</span>{' '}
          <span style={{ color: '#ffffff', fontWeight: 600 }}>{theyGive}</span>
        </div>
      </div>

      {/* Success state */}
      {success && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            background: 'rgba(76,175,80,0.15)',
            border: '1px solid rgba(76,175,80,0.4)',
            borderRadius: 8,
            color: '#81c784',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 13,
            fontWeight: 600
          }}
        >
          <span style={{ fontSize: 16 }}>✓</span>
          Proposal sent!
        </div>
      )}

      {/* Safety prompt overlay */}
      {showSafety && (
        <SafetyPrompt onConfirm={handleSafetyConfirm} onCancel={handleSafetyCancel} />
      )}

      {/* Propose button (not yet proposing, not success) */}
      {!proposing && !success && (
        <button
          onClick={handleProposeClick}
          style={{
            width: '100%',
            padding: '10px',
            background: 'linear-gradient(135deg, rgba(124,77,255,0.8), rgba(94,53,177,0.8))',
            border: '1px solid rgba(124,77,255,0.4)',
            borderRadius: 8,
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,77,255,1), rgba(94,53,177,1))'
            e.currentTarget.style.boxShadow = '0 0 16px rgba(124,77,255,0.5)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,77,255,0.8), rgba(94,53,177,0.8))'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Propose Exchange
        </button>
      )}

      {/* Report concern link */}
      <div style={{ marginTop: 8, textAlign: 'right' }}>
        <a
          href={`mailto:safety@wisc.edu?subject=${encodeURIComponent('StarLink Safety Concern')}`}
          style={{
            fontSize: 11,
            color: 'rgba(255,120,100,0.65)',
            textDecoration: 'none',
            fontFamily: 'Inter, sans-serif',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,120,100,1)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,120,100,0.65)' }}
        >
          🚩 Report concern
        </a>
      </div>

      {/* Inline proposal form */}
      {proposing && !success && (
        <div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>What you'll give</label>
            <div
              style={{
                padding: '8px 10px',
                background: 'rgba(21, 101, 192, 0.18)',
                border: '1px solid rgba(144, 202, 249, 0.25)',
                borderRadius: 7,
                color: '#90caf9',
                fontSize: 13,
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {youGive}
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>What you'll get</label>
            <div
              style={{
                padding: '8px 10px',
                background: 'rgba(230, 81, 0, 0.18)',
                border: '1px solid rgba(255, 224, 130, 0.25)',
                borderRadius: 7,
                color: '#ffe082',
                fontSize: 13,
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {theyGive}
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Location</label>
            <select
              value={location}
              onChange={e => {
                setLocation(e.target.value)
                if (e.target.value !== 'custom') setCustomLocation('')
              }}
              style={{
                ...inputStyle,
                appearance: 'none',
                WebkitAppearance: 'none',
                cursor: 'pointer',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(124,77,255,0.5)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
            >
              <option value="" style={{ background: '#12102a' }}>Choose a location...</option>
              <option value="Memorial Union Terrace" style={{ background: '#12102a' }}>Memorial Union Terrace</option>
              <option value="College Library lobby" style={{ background: '#12102a' }}>College Library lobby</option>
              <option value="Union South atrium" style={{ background: '#12102a' }}>Union South atrium</option>
              <option value="Grainger Hall lobby" style={{ background: '#12102a' }}>Grainger Hall lobby</option>
              <option value="Engineering Hall" style={{ background: '#12102a' }}>Engineering Hall</option>
              <option value="online" style={{ background: '#12102a' }}>Online (video call)</option>
              <option value="custom" style={{ background: '#12102a' }}>Other (type below)...</option>
            </select>
            {location === 'custom' && (
              <input
                type="text"
                value={customLocation}
                onChange={e => setCustomLocation(e.target.value)}
                placeholder="Enter location..."
                style={{ ...inputStyle, marginTop: 6 }}
                onFocus={e => { e.target.style.borderColor = 'rgba(124,77,255,0.5)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
              />
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Time</label>
            <input
              type="text"
              value={timeSlot}
              onChange={e => setTimeSlot(e.target.value)}
              placeholder="e.g. Thursday 3pm"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(124,77,255,0.5)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#ef9a9a', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleConfirm}
              disabled={sending}
              style={{
                flex: 1,
                padding: '9px',
                background: sending
                  ? 'rgba(124,77,255,0.4)'
                  : 'linear-gradient(135deg, rgba(124,77,255,0.9), rgba(94,53,177,0.9))',
                border: '1px solid rgba(124,77,255,0.5)',
                borderRadius: 8,
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: sending ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {sending ? 'Sending…' : 'Confirm'}
            </button>
            <button
              onClick={handleCancel}
              disabled={sending}
              style={{
                flex: 1,
                padding: '9px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                color: 'rgba(255,255,255,0.6)',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: sending ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (!sending) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export default function SkillExchange() {
  const connections = useStore(s => s.connections)
  const users = useStore(s => s.users)
  const selectedUser = useStore(s => s.selectedUser)
  const setShowSkillExchange = useStore(s => s.setShowSkillExchange)

  // Determine if ConnectionPanel is open (selectedUser exists)
  const connectionPanelOpen = !!selectedUser

  // Build skill-match pairs from connections where skill_match === true
  const skillMatchConns = connections.filter(c => c.skill_match === true)

  // Build the full match list with computed youGive / theyGive
  // "current user" for the exchange proposals is selectedUser if set, otherwise null
  const buildMatches = (conn) => {
    const userA = users.find(u => u.id === conn.user_a_id)
    const userB = users.find(u => u.id === conn.user_b_id)
    if (!userA || !userB) return null

    // Determine perspective: if selectedUser exists use them as "me"
    let me, other
    if (selectedUser) {
      if (conn.user_a_id === selectedUser.id) {
        me = userA
        other = userB
      } else if (conn.user_b_id === selectedUser.id) {
        me = userB
        other = userA
      } else {
        return null // connection doesn't involve selectedUser
      }
    } else {
      // No selected user — show from userA perspective by default
      me = userA
      other = userB
    }

    // Find overlapping: what "me" offers that "other" needs
    const meOffers = me.skills_offer || []
    const otherNeeds = other.skills_need || []
    const meGives = meOffers.find(s => otherNeeds.includes(s)) || meOffers[0] || ''

    // Find: what "other" offers that "me" needs
    const otherOffers = other.skills_offer || []
    const meNeeds = me.skills_need || []
    const theyGive = otherOffers.find(s => meNeeds.includes(s)) || otherOffers[0] || ''

    return {
      id: conn.id,
      score: conn.score || 0,
      other,
      me,
      youGive: meGives,
      theyGive
    }
  }

  let matches = skillMatchConns.map(buildMatches).filter(Boolean)

  if (selectedUser) {
    // Already filtered to only selectedUser's connections above
    matches.sort((a, b) => b.score - a.score)
  } else {
    matches.sort((a, b) => b.score - a.score)
  }

  const panelRight = connectionPanelOpen ? 384 : 0

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: panelRight,
        height: '100vh',
        width: 380,
        background: 'rgba(10, 10, 26, 0.96)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        zIndex: 49,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'right 0.3s ease',
        animation: 'skillPanelSlideIn 0.3s ease'
      }}
    >
      <style>{`
        @keyframes skillPanelSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: 'Space Grotesk, sans-serif',
                margin: 0,
                lineHeight: 1.2
              }}
            >
              ⚡ Skill Exchanges
            </h2>
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'Inter, sans-serif',
                margin: '6px 0 0',
                lineHeight: 1.4
              }}
            >
              {selectedUser
                ? `Matches for ${selectedUser.name}`
                : "People whose skills complement yours"}
            </p>
          </div>

          <button
            onClick={() => setShowSkillExchange(false)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px' }}>
        {matches.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
            {selectedUser
              ? `No skill matches found for ${selectedUser.name}.`
              : 'No skill exchange matches found yet.'}
          </div>
        ) : (
          matches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              currentUser={match.me}
            />
          ))
        )}
      </div>
    </div>
  )
}
