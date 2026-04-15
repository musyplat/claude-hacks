export default function SafetyPrompt({ onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          width: 380,
          maxWidth: 'calc(100vw - 48px)',
          background: 'rgba(18, 14, 38, 0.92)',
          border: '1px solid rgba(124, 77, 255, 0.35)',
          borderRadius: 16,
          padding: '28px 28px 24px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,77,255,0.1)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 22 }}>🛡️</span>
          <h2
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'Space Grotesk, sans-serif',
              lineHeight: 1.2,
            }}
          >
            A few things before you meet
          </h2>
        </div>

        {/* Safety tips */}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {[
            'Start with a quick online chat',
            'Meet in public campus spaces',
            'Keep first sessions to 30 min',
            'You can cancel anytime',
          ].map((tip) => (
            <li
              key={tip}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 13,
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.4,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'rgba(76, 175, 80, 0.18)',
                  border: '1px solid rgba(76,175,80,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: '#81c784',
                  fontWeight: 700,
                }}
              >
                ✓
              </span>
              {tip}
            </li>
          ))}
        </ul>

        {/* Suggested spots */}
        <div
          style={{
            background: 'rgba(124, 77, 255, 0.08)',
            border: '1px solid rgba(124, 77, 255, 0.2)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 22,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'rgba(179,157,255,0.7)',
              marginBottom: 8,
            }}
          >
            Suggested spots
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
            }}
          >
            {[
              'Memorial Union Terrace',
              'College Library (lobby)',
              'Union South atrium',
              'Grainger Hall',
            ].map((spot) => (
              <li
                key={spot}
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <span style={{ color: 'rgba(179,157,255,0.6)', fontSize: 10 }}>•</span>
                {spot}
              </li>
            ))}
          </ul>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'linear-gradient(135deg, rgba(124,77,255,0.9), rgba(94,53,177,0.9))',
              border: '1px solid rgba(124,77,255,0.5)',
              borderRadius: 9,
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(124,77,255,1), rgba(94,53,177,1))'
              e.currentTarget.style.boxShadow = '0 0 16px rgba(124,77,255,0.45)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(124,77,255,0.9), rgba(94,53,177,0.9))'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Got it, continue
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 9,
              color: 'rgba(255,255,255,0.55)',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
