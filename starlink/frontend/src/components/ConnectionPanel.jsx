import { useState } from 'react'
import useStore from '../store.js'
import ConnectionCard from './ConnectionCard.jsx'

function ScoreBar({ score }) {
  const pct = Math.round((score / 10) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 4,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: score >= 7
              ? 'linear-gradient(90deg, #4fc3f7, #7c4dff)'
              : score >= 4
              ? 'linear-gradient(90deg, #ffd54f, #4fc3f7)'
              : '#ff8a65',
            borderRadius: 2,
            transition: 'width 0.5s ease'
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', minWidth: 24 }}>
        {score.toFixed(1)}
      </span>
    </div>
  )
}

function TagList({ items, bg, textColor }) {
  if (!items || items.length === 0) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {items.map((item, i) => (
        <span
          key={i}
          className="tag"
          style={{ background: bg, color: textColor }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function ProfileSection({ emoji, label, items, bg, textColor }) {
  if (!items || items.length === 0) return null
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.35)',
        marginBottom: 6
      }}>
        {emoji} {label}
      </div>
      <TagList items={items} bg={bg} textColor={textColor} />
    </div>
  )
}

function ConnectionItem({ conn, onSelect }) {
  const users = useStore(s => s.users)
  const selectedUser = useStore(s => s.selectedUser)

  const otherId = conn.user_a_id === selectedUser?.id ? conn.user_b_id : conn.user_a_id
  const other = users.find(u => u.id === otherId)

  if (!other) return null

  const sharedCount = (conn.shared_likes?.length || 0) + (conn.shared_dislikes?.length || 0)

  return (
    <button
      onClick={() => onSelect(conn.id)}
      style={{
        width: '100%',
        padding: '12px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s ease',
        marginBottom: 8
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(124,77,255,0.12)'
        e.currentTarget.style.borderColor = 'rgba(124,77,255,0.3)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: other.avatar_color || '#7c4dff',
            flexShrink: 0,
            boxShadow: `0 0 6px ${other.avatar_color || '#7c4dff'}`
          }}
        />
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 14,
          fontWeight: 600,
          color: '#ffffff',
          flex: 1
        }}>
          {other.name}
        </span>
        {conn.skill_match && (
          <span
            title="Skill match"
            style={{
              fontSize: 12,
              background: 'rgba(255,213,79,0.15)',
              color: '#ffd54f',
              padding: '2px 6px',
              borderRadius: 4,
              fontWeight: 600
            }}
          >
            ⚡ skill
          </span>
        )}
      </div>

      <ScoreBar score={conn.score || 0} />

      {sharedCount > 0 && (
        <p style={{
          marginTop: 6,
          fontSize: 12,
          color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.4
        }}>
          {conn.shared_likes?.length > 0 && `${conn.shared_likes.length} shared interest${conn.shared_likes.length > 1 ? 's' : ''}`}
          {conn.shared_likes?.length > 0 && conn.shared_dislikes?.length > 0 && ' · '}
          {conn.shared_dislikes?.length > 0 && `${conn.shared_dislikes.length} shared dislike${conn.shared_dislikes.length > 1 ? 's' : ''}`}
        </p>
      )}
    </button>
  )
}

export default function ConnectionPanel() {
  const selectedUser = useStore(s => s.selectedUser)
  const userConnections = useStore(s => s.userConnections)
  const selectedConnection = useStore(s => s.selectedConnection)
  const clearSelection = useStore(s => s.clearSelection)
  const selectConnection = useStore(s => s.selectConnection)

  if (!selectedUser) return null

  const likes = Array.isArray(selectedUser.likes) ? selectedUser.likes : []
  const dislikes = Array.isArray(selectedUser.dislikes) ? selectedUser.dislikes : []
  const skills_offer = Array.isArray(selectedUser.skills_offer) ? selectedUser.skills_offer : []
  const skills_need = Array.isArray(selectedUser.skills_need) ? selectedUser.skills_need : []

  return (
    <>
      <div
        className="panel-slide"
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: 384,
          background: 'rgba(15, 15, 35, 0.97)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: selectedUser.avatar_color || '#7c4dff',
                  boxShadow: `0 0 12px ${selectedUser.avatar_color || '#7c4dff'}`,
                  flexShrink: 0,
                  marginTop: 4
                }}
              />
              <div>
                <h2
                  className="font-space"
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.2
                  }}
                >
                  {selectedUser.name}
                </h2>
                {selectedUser.feeling && (
                  <span style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.45)',
                    marginTop: 2,
                    display: 'block'
                  }}>
                    Feeling {selectedUser.feeling}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={clearSelection}
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

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Profile blocks */}
          <div style={{ marginBottom: 20 }}>
            <ProfileSection
              emoji="❤️"
              label="Likes"
              items={likes}
              bg="rgba(27, 94, 32, 0.6)"
              textColor="#a5d6a7"
            />
            <ProfileSection
              emoji="💔"
              label="Dislikes"
              items={dislikes}
              bg="rgba(127, 0, 0, 0.6)"
              textColor="#ef9a9a"
            />
            {selectedUser.feeling && (
              <div style={{ marginBottom: 12 }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.35)',
                  marginBottom: 6
                }}>
                  😶 Feeling
                </div>
                <span
                  className="tag"
                  style={{ background: 'rgba(74, 20, 140, 0.6)', color: '#ce93d8' }}
                >
                  {selectedUser.feeling}
                </span>
              </div>
            )}
            <ProfileSection
              emoji="🎁"
              label="Offers"
              items={skills_offer}
              bg="rgba(13, 71, 161, 0.6)"
              textColor="#90caf9"
            />
            <ProfileSection
              emoji="🙋"
              label="Needs"
              items={skills_need}
              bg="rgba(230, 81, 0, 0.6)"
              textColor="#ffe082"
            />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 20 }} />

          {/* Connections list */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14
            }}>
              <h3
                className="font-space"
                style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}
              >
                Connections ({userConnections.length})
              </h3>
              {userConnections.length > 0 && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                  Click to view detail
                </span>
              )}
            </div>

            {userConnections.length === 0 ? (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '24px 0' }}>
                No connections yet
              </p>
            ) : (
              userConnections
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map(conn => (
                  <ConnectionItem
                    key={conn.id}
                    conn={conn}
                    onSelect={selectConnection}
                  />
                ))
            )}
          </div>
        </div>
      </div>

      {/* Connection card modal */}
      {selectedConnection && (
        <ConnectionCard />
      )}
    </>
  )
}
