import { useEffect, useState } from 'react'
import { fetchCohorts, joinCohort } from '../api.js'

const COHORT_ICONS = ['🚀', '📚', '🏠', '🎯', '⚡', '🌟']

// Pre-generate stable star positions so they don't shift on re-render
const STARS = Array.from({ length: 80 }, (_, i) => {
  const seed = (i * 7919 + 1234567) % 100000
  const x = ((seed * 9301 + 49297) % 233280) / 233280 * 100
  const y = ((seed * 3571 + 12345) % 233280) / 233280 * 100
  const large = ((seed * 1301 + 99971) % 100) > 80
  const opacity = ((seed * 6271 + 28657) % 100) / 100 * 0.6 + 0.2
  const delay = ((seed * 2803 + 19937) % 300) / 100
  return { x, y, large, opacity, delay }
})

export default function CohortGate({ onSelectCohort }) {
  const [cohorts, setCohorts] = useState([])
  const [loading, setLoading] = useState(true)
  const [accessCode, setAccessCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    fetchCohorts()
      .then(data => {
        setCohorts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSelectCohort = (cohort) => {
    onSelectCohort(cohort)
  }

  const handleJoinByCode = async (e) => {
    e.preventDefault()
    if (!accessCode.trim()) return
    setJoining(true)
    setError('')
    try {
      const result = await joinCohort(accessCode.trim().toUpperCase(), 'guest-' + Date.now())
      if (result.error) {
        setError(result.error)
      } else {
        onSelectCohort(result)
      }
    } catch (err) {
      setError('Could not find that cohort. Check your code and try again.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div style={styles.overlay}>
      {/* Starfield background dots */}
      <div style={styles.stars} aria-hidden="true">
        {STARS.map((s, i) => (
          <div
            key={i}
            style={{
              ...styles.star,
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.large ? 2 : 1,
              height: s.large ? 2 : 1,
              opacity: s.opacity,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoStar}>★</span>
            <span style={styles.logoText}>StarLink</span>
          </div>
          <p style={styles.tagline}>Find your people. Start somewhere.</p>
        </div>

        {/* Community picker */}
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Choose your community:</p>

          {loading ? (
            <div style={styles.loadingRow}>
              <div style={styles.spinner} />
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading communities…</span>
            </div>
          ) : cohorts.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center' }}>
              No communities found. Enter a code below to join one.
            </p>
          ) : (
            <div style={styles.cardList}>
              {cohorts.map((cohort, i) => (
                <button
                  key={cohort.id}
                  style={{
                    ...styles.card,
                    ...(hoveredId === cohort.id ? styles.cardHovered : {}),
                  }}
                  onMouseEnter={() => setHoveredId(cohort.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleSelectCohort(cohort)}
                >
                  <span style={styles.cardIcon}>{COHORT_ICONS[i % COHORT_ICONS.length]}</span>
                  <div style={styles.cardBody}>
                    <span style={styles.cardName}>{cohort.name}</span>
                    <span style={styles.cardMeta}>
                      {cohort.member_count ?? 0} member{cohort.member_count !== 1 ? 's' : ''}
                      {cohort.access_code ? ` · Join with ${cohort.access_code}` : ''}
                    </span>
                  </div>
                  <span style={styles.cardArrow}>›</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or enter your group code</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Access code form */}
        <form style={styles.codeForm} onSubmit={handleJoinByCode}>
          <input
            type="text"
            value={accessCode}
            onChange={e => setAccessCode(e.target.value.toUpperCase())}
            placeholder="e.g. HACK25"
            maxLength={10}
            style={styles.codeInput}
          />
          <button
            type="submit"
            disabled={joining || !accessCode.trim()}
            style={{
              ...styles.joinButton,
              ...(joining || !accessCode.trim() ? styles.joinButtonDisabled : {}),
            }}
          >
            {joining ? '…' : 'Join →'}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#060610',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    fontFamily: "'Inter', sans-serif",
    overflow: 'hidden',
  },
  stars: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    background: '#ffffff',
    borderRadius: '50%',
    animation: 'twinkle 3s ease-in-out infinite',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 480,
    padding: '0 24px',
    animation: 'fadeInUp 0.6s ease-out both',
  },
  header: {
    textAlign: 'center',
    marginBottom: 36,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  logoStar: {
    fontSize: 28,
    color: '#7c4dff',
    filter: 'drop-shadow(0 0 8px #7c4dff)',
  },
  logoText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: 32,
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  tagline: {
    fontFamily: "'Space Grotesk', sans-serif",
    color: 'rgba(255,255,255,0.45)',
    fontSize: 15,
    margin: 0,
    letterSpacing: '0.2px',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 12,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    padding: '16px 0',
  },
  spinner: {
    width: 18,
    height: 18,
    border: '2px solid rgba(124,77,255,0.3)',
    borderTop: '2px solid #7c4dff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: 'rgba(15,15,40,0.8)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '14px 16px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  cardHovered: {
    borderColor: '#7c4dff',
    background: 'rgba(124,77,255,0.1)',
    transform: 'translateY(-1px)',
  },
  cardIcon: {
    fontSize: 22,
    flexShrink: 0,
    lineHeight: 1,
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardMeta: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: 400,
  },
  cardArrow: {
    color: '#7c4dff',
    fontSize: 20,
    fontWeight: 600,
    flexShrink: 0,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  codeForm: {
    display: 'flex',
    gap: 10,
  },
  codeInput: {
    flex: 1,
    background: 'rgba(15,15,40,0.8)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: 15,
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 500,
    letterSpacing: '1px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  joinButton: {
    background: '#7c4dff',
    color: '#ffffff',
    border: 'none',
    borderRadius: 10,
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.2s, transform 0.15s',
  },
  joinButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    transform: 'none',
  },
  error: {
    color: '#ff5252',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
}
