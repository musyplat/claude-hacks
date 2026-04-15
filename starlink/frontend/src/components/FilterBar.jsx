import useStore from '../store.js'

const FILTERS = [
  { mode: 'all', label: 'All', icon: '★' },
  { mode: 'interest', label: 'Interests', icon: '❤️', color: '#4fc3f7' },
  { mode: 'dislike', label: 'Dislikes', icon: '💔', color: '#ff8a65' },
  { mode: 'skill', label: 'Skills', icon: '⚡', color: '#ffd54f' }
]

export default function FilterBar() {
  const filterMode = useStore(s => s.filterMode)
  const setFilter = useStore(s => s.setFilter)
  const setShowCreateForm = useStore(s => s.setShowCreateForm)
  const setShowSkillExchange = useStore(s => s.setShowSkillExchange)
  const showSkillExchange = useStore(s => s.showSkillExchange)

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 12
      }}
    >
      {/* Filter buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(15,15,35,0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '6px 8px',
          backdropFilter: 'blur(12px)'
        }}
      >
        {FILTERS.map(f => {
          const isActive = filterMode === f.mode
          return (
            <button
              key={f.mode}
              onClick={() => setFilter(f.mode)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                background: isActive
                  ? 'rgba(124,77,255,0.25)'
                  : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.45)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                position: 'relative'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
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
              <span style={{ fontSize: 11 }}>{f.icon}</span>
              {f.label}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#7c4dff'
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          background: 'rgba(15,15,35,0.75)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8,
          padding: '7px 14px',
          backdropFilter: 'blur(8px)'
        }}
      >
        <LegendItem color="#4fc3f7" label="Interest" />
        <LegendItem color="#ff8a65" label="Dislike" />
        <LegendItem color="#ffd54f" label="Skill" />
      </div>

      {/* Skill Matches button */}
      <button
        onClick={() => setShowSkillExchange(!showSkillExchange)}
        style={{
          padding: '10px 18px',
          background: showSkillExchange
            ? 'linear-gradient(135deg, rgba(255,213,79,0.3), rgba(124,77,255,0.3))'
            : 'linear-gradient(135deg, rgba(255,213,79,0.15), rgba(124,77,255,0.15))',
          border: showSkillExchange
            ? '1px solid rgba(255,213,79,0.6)'
            : '1px solid rgba(255,213,79,0.25)',
          borderRadius: 10,
          color: '#ffd54f',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'Space Grotesk, sans-serif',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,213,79,0.3), rgba(124,77,255,0.3))'
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,213,79,0.25)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = showSkillExchange
            ? 'linear-gradient(135deg, rgba(255,213,79,0.3), rgba(124,77,255,0.3))'
            : 'linear-gradient(135deg, rgba(255,213,79,0.15), rgba(124,77,255,0.15))'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        ⚡ Skill Matches
      </button>

      {/* Add star button */}
      <button
        onClick={() => setShowCreateForm(true)}
        style={{
          padding: '10px 18px',
          background: 'linear-gradient(135deg, rgba(124,77,255,0.8), rgba(94,53,177,0.8))',
          border: '1px solid rgba(124,77,255,0.4)',
          borderRadius: 10,
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'Space Grotesk, sans-serif',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,77,255,1), rgba(94,53,177,1))'
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,77,255,0.4)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,77,255,0.8), rgba(94,53,177,0.8))'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 0L9.2 5.8L15 8L9.2 10.2L8 16L6.8 10.2L1 8L6.8 5.8L8 0Z" fill="white" />
        </svg>
        Add Your Star
      </button>
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 20,
        height: 2,
        background: color,
        borderRadius: 1,
        boxShadow: `0 0 4px ${color}`
      }} />
      <span style={{
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
        fontFamily: 'Inter, sans-serif'
      }}>
        {label}
      </span>
    </div>
  )
}
