import useStore from '../store.js'
import { proposeExchange } from '../api.js'
import { useState } from 'react'

function Section({ emoji, title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10
      }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <h4
          className="font-space"
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)'
          }}
        >
          {title}
        </h4>
      </div>
      <div style={{
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {children}
      </div>
    </div>
  )
}

export default function ConnectionCard() {
  const selectedConnection = useStore(s => s.selectedConnection)
  const selectedUser = useStore(s => s.selectedUser)
  const users = useStore(s => s.users)
  const setSelectedConnection = useStore(s => s.selectConnection)
  const [proposing, setProposing] = useState(false)
  const [proposed, setProposed] = useState(false)

  if (!selectedConnection) return null

  const closeCard = () => useStore.setState({ selectedConnection: null })

  const userA = users.find(u => u.id === selectedConnection.user_a_id)
  const userB = users.find(u => u.id === selectedConnection.user_b_id)

  const handlePropose = async () => {
    if (proposing || proposed) return
    setProposing(true)
    try {
      await proposeExchange({
        connection_id: selectedConnection.id,
        proposer_id: selectedUser?.id,
        message: selectedConnection.exchange_text || 'Let\'s connect!'
      })
      setProposed(true)
    } catch (err) {
      console.error('Exchange proposal failed:', err)
    } finally {
      setProposing(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCard}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 80
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(520px, calc(100vw - 440px))',
          maxHeight: '80vh',
          background: 'rgba(12, 12, 30, 0.98)',
          border: '1px solid rgba(124,77,255,0.3)',
          borderRadius: 20,
          boxShadow: '0 0 60px rgba(124,77,255,0.15), 0 24px 64px rgba(0,0,0,0.6)',
          zIndex: 90,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {userA && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: userA.avatar_color || '#7c4dff',
                    boxShadow: `0 0 6px ${userA.avatar_color || '#7c4dff'}`
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    {userA.name}
                  </span>
                </div>
              )}
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>↔</span>
              {userB && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: userB.avatar_color || '#7c4dff',
                    boxShadow: `0 0 6px ${userB.avatar_color || '#7c4dff'}`
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    {userB.name}
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                height: 3,
                width: 48,
                background: `linear-gradient(90deg, ${userA?.avatar_color || '#7c4dff'}, ${userB?.avatar_color || '#4fc3f7'})`,
                borderRadius: 2
              }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                Score: {selectedConnection.score?.toFixed(1) || '—'}
              </span>
            </div>
          </div>

          <button
            onClick={closeCard}
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
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {selectedConnection.bridge_text && (
            <Section emoji="🌉" title="The Bridge">
              <p style={{
                fontSize: 14,
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.82)'
              }}>
                {selectedConnection.bridge_text}
              </p>
            </Section>
          )}

          {selectedConnection.exchange_text && (
            <Section emoji="⚡" title="The Exchange">
              <p style={{
                fontSize: 14,
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.82)',
                marginBottom: 14
              }}>
                {selectedConnection.exchange_text}
              </p>
              <button
                onClick={handlePropose}
                disabled={proposing || proposed}
                style={{
                  padding: '9px 20px',
                  background: proposed
                    ? 'rgba(76,175,80,0.2)'
                    : 'linear-gradient(135deg, #7c4dff, #5e35b1)',
                  border: proposed ? '1px solid rgba(76,175,80,0.4)' : 'none',
                  borderRadius: 8,
                  color: proposed ? '#81c784' : '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: proposing || proposed ? 'default' : 'pointer',
                  opacity: proposing ? 0.7 : 1,
                  transition: 'all 0.2s',
                  fontFamily: 'Space Grotesk, sans-serif'
                }}
              >
                {proposed ? '✓ Exchange Proposed!' : proposing ? 'Proposing…' : 'Propose Exchange'}
              </button>
            </Section>
          )}

          {selectedConnection.spark_text && (
            <Section emoji="✨" title="The Spark">
              <p style={{
                fontSize: 14,
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.82)',
                fontStyle: 'italic'
              }}>
                &ldquo;{selectedConnection.spark_text}&rdquo;
              </p>
            </Section>
          )}

          {selectedConnection.meet_suggestion && (
            <Section emoji="📍" title="Meet">
              <p style={{
                fontSize: 14,
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.82)'
              }}>
                {selectedConnection.meet_suggestion}
              </p>
            </Section>
          )}

          {/* Shared tags */}
          {(selectedConnection.shared_likes?.length > 0 || selectedConnection.shared_dislikes?.length > 0) && (
            <div style={{ marginTop: 4 }}>
              {selectedConnection.shared_likes?.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.3)',
                    marginBottom: 6
                  }}>
                    Shared Interests
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {selectedConnection.shared_likes.map((item, i) => (
                      <span
                        key={i}
                        className="tag"
                        style={{ background: 'rgba(79,195,247,0.12)', color: '#4fc3f7' }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedConnection.shared_dislikes?.length > 0 && (
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.3)',
                    marginBottom: 6
                  }}>
                    Shared Dislikes
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {selectedConnection.shared_dislikes.map((item, i) => (
                      <span
                        key={i}
                        className="tag"
                        style={{ background: 'rgba(255,138,101,0.12)', color: '#ff8a65' }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
