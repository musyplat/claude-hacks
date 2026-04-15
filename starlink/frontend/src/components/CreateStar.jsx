import { useState } from 'react'
import useStore from '../store.js'
import { feelingToSafeRequest } from '../utils/emotionToIntent.js'

// ─── Data ────────────────────────────────────────────────────────────────────

const GOALS = [
  { id: 'help_me', emoji: '🙋', label: 'I need help' },
  { id: 'help',    emoji: '🎁', label: 'I can help someone' },
  { id: 'buddy',   emoji: '🤝', label: 'I want a buddy' },
  { id: 'meet',    emoji: '🌟', label: 'Meet interesting people' }
]

const NEED_CARDS = [
  { id: 'resume_review',      emoji: '📝', label: 'Resume Review' },
  { id: 'mock_interview',     emoji: '🎤', label: 'Mock Interview' },
  { id: 'coding_help',        emoji: '💻', label: 'Coding Help' },
  { id: 'stats_math',         emoji: '📊', label: 'Stats / Math' },
  { id: 'essay_editing',      emoji: '✍️', label: 'Essay Editing' },
  { id: 'speaking_practice',  emoji: '🗣️', label: 'Speaking Practice' },
  { id: 'design_feedback',    emoji: '📸', label: 'Design Feedback' },
  { id: 'gym_buddy',          emoji: '🏋️', label: 'Gym Buddy' },
  { id: 'study_partner',      emoji: '📚', label: 'Study Partner' }
]

const OFFER_CARDS = [
  { id: 'coding',             emoji: '💻', label: 'Coding / Dev' },
  { id: 'design',             emoji: '🎨', label: 'Design' },
  { id: 'writing',            emoji: '✍️', label: 'Writing / Editing' },
  { id: 'math_stats',         emoji: '📊', label: 'Math / Stats' },
  { id: 'career_advice',      emoji: '🎤', label: 'Career Advice' },
  { id: 'language',           emoji: '🌍', label: 'Language Exchange' },
  { id: 'fitness',            emoji: '🏋️', label: 'Fitness' },
  { id: 'accountability',     emoji: '✅', label: 'Accountability' },
  { id: 'brainstorming',      emoji: '💡', label: 'Brainstorming' }
]

const BUDDY_CARDS = [
  { id: 'study_session',   emoji: '📚', label: 'Study Session' },
  { id: 'gym_session',     emoji: '🏋️', label: 'Gym Session' },
  { id: 'coffee_chat',     emoji: '☕', label: 'Coffee Chat' },
  { id: 'cowork',          emoji: '💼', label: 'Co-working' },
  { id: 'walk_outside',    emoji: '🚶', label: 'Walk Outside' },
  { id: 'project_collab',  emoji: '🛠️', label: 'Project Collab' },
  { id: 'language_swap',   emoji: '🌍', label: 'Language Swap' },
  { id: 'accountability',  emoji: '✅', label: 'Accountability' },
  { id: 'gaming',          emoji: '🎮', label: 'Gaming' }
]

const FEELINGS = [
  { emoji: '😰', label: 'stressed' },
  { emoji: '😔', label: 'lonely' },
  { emoji: '🤔', label: 'curious' },
  { emoji: '⚡', label: 'energized' },
  { emoji: '😑', label: 'bored' },
  { emoji: '😵', label: 'overwhelmed' }
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cardsForGoal(goal) {
  if (goal === 'help_me') return NEED_CARDS
  if (goal === 'help')    return OFFER_CARDS
  if (goal === 'buddy')   return BUDDY_CARDS
  return null // 'meet' skips to name
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressDots({ total, current }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 22 : 8,
            height: 8,
            borderRadius: 4,
            background: i <= current ? '#7c4dff' : 'rgba(255,255,255,0.15)',
            transition: 'all 0.3s ease'
          }}
        />
      ))}
    </div>
  )
}

function TapCard({ emoji, label, selected, onClick, large }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: large ? '20px 12px' : '14px 10px',
        borderRadius: 14,
        border: selected
          ? '2px solid #7c4dff'
          : hovered
          ? '1px solid rgba(124,77,255,0.5)'
          : '1px solid rgba(255,255,255,0.1)',
        background: selected
          ? 'rgba(124,77,255,0.25)'
          : hovered
          ? 'rgba(124,77,255,0.1)'
          : 'rgba(20,20,50,0.8)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: large ? 10 : 6,
        transition: 'all 0.2s ease',
        boxShadow: selected
          ? '0 0 16px rgba(124,77,255,0.35)'
          : hovered
          ? '0 0 10px rgba(124,77,255,0.15)'
          : 'none',
        fontFamily: 'Inter, sans-serif',
        width: '100%'
      }}
    >
      <span style={{ fontSize: large ? 32 : 24 }}>{emoji}</span>
      <span style={{
        fontSize: large ? 14 : 12,
        fontWeight: selected ? 600 : 400,
        color: selected ? '#d4b8ff' : 'rgba(255,255,255,0.75)',
        textAlign: 'center',
        lineHeight: 1.3
      }}>
        {label}
      </span>
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CreateStar({ onClose }) {
  const addNewUser = useStore(s => s.addNewUser)

  // step: 0=goal, 1=specific need, 2=feeling, 3=name, 4=submitting
  const [step, setStep]               = useState(0)
  const [direction, setDirection]     = useState(1) // 1=forward, -1=back
  const [animating, setAnimating]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState(null)

  const [goal, setGoal]               = useState(null)
  const [selectedCards, setSelectedCards] = useState([])
  const [selectedFeeling, setSelectedFeeling] = useState(null)
  const [name, setName]               = useState('')

  // Compute total steps dynamically
  // goal 'meet' skips the card step: 0(goal) -> 2(feeling) -> 3(name)
  const skipCards = goal === 'meet'
  const totalSteps = skipCards ? 3 : 4

  // Map logical steps to display index for progress dots
  // step 0=goal, 1=cards (skipped if meet), 2=feeling, 3=name
  const progressIndex = step

  function goTo(nextStep, dir = 1) {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setStep(nextStep)
      setAnimating(false)
    }, 250)
  }

  function handleGoalSelect(goalId) {
    setGoal(goalId)
    setSelectedCards([])
    goTo(goalId === 'meet' ? 2 : 1, 1)
  }

  function toggleCard(id) {
    setSelectedCards(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id)
      if (prev.length >= 3) return prev // max 3
      return [...prev, id]
    })
  }

  function handleBack() {
    if (step === 1) { goTo(0, -1); return }
    if (step === 2) { goTo(skipCards ? 0 : 1, -1); return }
    if (step === 3) { goTo(2, -1); return }
  }

  async function handleSubmit() {
    if (!name.trim() || submitting) return
    setSubmitting(true)
    setError(null)

    const safeRequest = selectedFeeling ? feelingToSafeRequest(selectedFeeling) : null

    const payload = {
      name: name.trim(),
      current_feeling: selectedFeeling || null,
      safe_intent: safeRequest?.safeIntent || null,
      ...(goal === 'help_me' && { skills_need: selectedCards }),
      ...(goal === 'help'    && { skills_offer: selectedCards }),
      ...(goal === 'buddy'   && { likes: selectedCards }),
      ...(goal === 'meet'    && { likes: [] })
    }

    try {
      await addNewUser(payload)
      onClose()
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  // ── Slide animation style ──
  const slideStyle = {
    transform: animating
      ? `translateX(${direction * -60}px)`
      : 'translateX(0)',
    opacity: animating ? 0 : 1,
    transition: 'transform 0.25s ease, opacity 0.25s ease'
  }

  const cards = goal ? cardsForGoal(goal) : null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 100
        }}
      />

      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(500px, calc(100vw - 32px))',
          maxHeight: 'min(700px, calc(100vh - 40px))',
          display: 'flex',
          flexDirection: 'column',
          background: '#060610',
          border: '1px solid rgba(124,77,255,0.35)',
          borderRadius: 22,
          boxShadow: '0 0 80px rgba(124,77,255,0.2), 0 32px 64px rgba(0,0,0,0.8)',
          zIndex: 110,
          overflow: 'hidden',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {/* Progress bar strip */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{
            height: '100%',
            width: `${((step) / (totalSteps - 1)) * 100}%`,
            background: 'linear-gradient(90deg, #7c4dff, #4fc3f7)',
            transition: 'width 0.35s ease'
          }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '18px 22px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <ProgressDots total={totalSteps} current={step} />
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          >
            ✕
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 22px 8px' }}>
          <div style={slideStyle}>

            {/* ── Step 0: Goal selection ── */}
            {step === 0 && (
              <div>
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 6,
                  fontFamily: 'Space Grotesk, sans-serif'
                }}>
                  What brings you here right now?
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 22 }}>
                  Tap one to get started.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12
                }}>
                  {GOALS.map(g => (
                    <TapCard
                      key={g.id}
                      emoji={g.emoji}
                      label={g.label}
                      selected={goal === g.id}
                      onClick={() => handleGoalSelect(g.id)}
                      large
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 1: Specific cards ── */}
            {step === 1 && cards && (
              <div>
                <h2 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 4,
                  fontFamily: 'Space Grotesk, sans-serif'
                }}>
                  {goal === 'help_me' && 'What do you need help with?'}
                  {goal === 'help'    && 'What can you offer?'}
                  {goal === 'buddy'   && 'What kind of session?'}
                </h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
                  Pick up to 3. {selectedCards.length > 0 && `${selectedCards.length} selected.`}
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10
                }}>
                  {cards.map(c => (
                    <TapCard
                      key={c.id}
                      emoji={c.emoji}
                      label={c.label}
                      selected={selectedCards.includes(c.id)}
                      onClick={() => toggleCard(c.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Feeling (optional) ── */}
            {step === 2 && (
              <div>
                <h2 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 4,
                  fontFamily: 'Space Grotesk, sans-serif'
                }}>
                  How are you feeling right now?
                </h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                  Optional — this helps us find the right kind of interaction for you.
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 22 }}>
                  Your emotional state is never shown to other users.
                </p>
                <div style={{
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  {FEELINGS.map(f => {
                    const isSelected = selectedFeeling === f.label
                    return (
                      <button
                        key={f.label}
                        onClick={() => setSelectedFeeling(isSelected ? null : f.label)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 12,
                          border: isSelected
                            ? '2px solid #7c4dff'
                            : '1px solid rgba(255,255,255,0.1)',
                          background: isSelected
                            ? 'rgba(124,77,255,0.25)'
                            : 'rgba(20,20,50,0.8)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 5,
                          transition: 'all 0.15s',
                          boxShadow: isSelected ? '0 0 12px rgba(124,77,255,0.3)' : 'none'
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.background = 'rgba(124,77,255,0.1)'
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.background = 'rgba(20,20,50,0.8)'
                        }}
                      >
                        <span style={{ fontSize: 26 }}>{f.emoji}</span>
                        <span style={{
                          fontSize: 11,
                          color: isSelected ? '#d4b8ff' : 'rgba(255,255,255,0.5)',
                          fontFamily: 'Inter, sans-serif',
                          textTransform: 'capitalize'
                        }}>
                          {f.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Step 3: Name ── */}
            {step === 3 && (
              <div>
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 6,
                  fontFamily: 'Space Grotesk, sans-serif'
                }}>
                  What should we call you?
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 22 }}>
                  You can add more about yourself after joining.
                </p>
                <input
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && name.trim().length >= 2) handleSubmit()
                  }}
                  placeholder="Your name or nickname"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 18,
                    fontFamily: 'Space Grotesk, sans-serif',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,77,255,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
                {error && (
                  <p style={{ marginTop: 12, fontSize: 13, color: '#ef9a9a' }}>
                    {error}
                  </p>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 22px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0
        }}>
          {/* Back / Cancel */}
          {step === 0 ? (
            <button
              onClick={onClose}
              style={{
                padding: '10px 18px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: 'rgba(255,255,255,0.45)',
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={handleBack}
              style={{
                padding: '10px 18px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: 'rgba(255,255,255,0.45)',
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
            >
              ← Back
            </button>
          )}

          {/* Continue / Skip / Submit */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Next / Submit button */}
            {step === 1 && (
              <NextButton
                disabled={selectedCards.length === 0}
                onClick={() => goTo(2, 1)}
                label="Continue →"
              />
            )}

            {step === 2 && !selectedFeeling && (
              <button
                onClick={() => goTo(3, 1)}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 13,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer'
                }}
              >
                Skip
              </button>
            )}

            {step === 2 && selectedFeeling && (
              <NextButton
                disabled={false}
                onClick={() => goTo(3, 1)}
                label="Continue →"
              />
            )}

            {step === 3 && (
              <NextButton
                disabled={name.trim().length < 2 || submitting}
                onClick={handleSubmit}
                label={
                  submitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <SpinnerIcon />
                      Placing your star…
                    </span>
                  ) : (
                    <>
                      <StarIcon /> Launch My Star
                    </>
                  )
                }
              />
            )}
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>

      {/* Submitting overlay */}
      {submitting && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'rgba(12,12,30,0.95)',
            border: '1px solid rgba(124,77,255,0.4)',
            borderRadius: 16,
            padding: '28px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 0 60px rgba(124,77,255,0.3)',
            pointerEvents: 'auto'
          }}>
            <div style={{
              width: 36,
              height: 36,
              border: '3px solid rgba(124,77,255,0.3)',
              borderTop: '3px solid #7c4dff',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 15,
              fontWeight: 500
            }}>
              Your star is being placed in the constellation…
            </p>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function NextButton({ disabled, onClick, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 24px',
        background: disabled
          ? 'rgba(124,77,255,0.2)'
          : 'linear-gradient(135deg, #7c4dff, #5e35b1)',
        border: 'none',
        borderRadius: 10,
        color: disabled ? 'rgba(255,255,255,0.35)' : '#fff',
        fontSize: 14,
        fontWeight: 600,
        fontFamily: 'Space Grotesk, sans-serif',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: disabled ? 'none' : '0 4px 20px rgba(124,77,255,0.4)'
      }}
      onMouseEnter={e => {
        if (!disabled) e.currentTarget.style.boxShadow = '0 4px 28px rgba(124,77,255,0.6)'
      }}
      onMouseLeave={e => {
        if (!disabled) e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,77,255,0.4)'
      }}
    >
      {label}
    </button>
  )
}

function SpinnerIcon() {
  return (
    <div style={{
      width: 14,
      height: 14,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTop: '2px solid #fff',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0
    }} />
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8 0L9.2 5.8L15 8L9.2 10.2L8 16L6.8 10.2L1 8L6.8 5.8L8 0Z" fill="white" />
    </svg>
  )
}
