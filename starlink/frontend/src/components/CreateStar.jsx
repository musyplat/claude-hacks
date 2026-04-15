import { useState, useRef } from 'react'
import useStore from '../store.js'

const FEELINGS = [
  { emoji: '😰', label: 'stressed' },
  { emoji: '😔', label: 'lonely' },
  { emoji: '🤔', label: 'curious' },
  { emoji: '⚡', label: 'energized' },
  { emoji: '😑', label: 'bored' },
  { emoji: '😵', label: 'overwhelmed' }
]

const STEPS = ['Name', 'Likes', 'Dislikes', 'Feeling', 'Offers', 'Needs']

function TagInput({ tags, setTags, placeholder, max, accentColor }) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const val = input.trim()
    if (val && tags.length < max && !tags.includes(val)) {
      setTags([...tags, val])
      setInput('')
    }
  }

  const removeTag = (i) => {
    setTags(tags.filter((_, idx) => idx !== i))
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div>
      <div
        style={{
          minHeight: 44,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          alignItems: 'center',
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10,
          marginBottom: 8
        }}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            style={{
              background: accentColor ? `${accentColor}22` : 'rgba(124,77,255,0.2)',
              color: accentColor || '#b39ddb',
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {tag}
            <button
              onClick={() => removeTag(i)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                opacity: 0.6,
                cursor: 'pointer',
                fontSize: 12,
                padding: 0,
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </span>
        ))}
        {tags.length < max && (
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onBlur={addTag}
            placeholder={tags.length === 0 ? placeholder : ''}
            style={{
              flex: 1,
              minWidth: 80,
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 13,
              outline: 'none',
              fontFamily: 'Inter, sans-serif'
            }}
          />
        )}
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>
        Press Enter or comma to add · {tags.length}/{max} added
      </p>
    </div>
  )
}

export default function CreateStar({ onClose }) {
  const addNewUser = useStore(s => s.addNewUser)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [name, setName] = useState('')
  const [likes, setLikes] = useState([])
  const [dislikes, setDislikes] = useState([])
  const [feeling, setFeeling] = useState(null)
  const [skillsOffer, setSkillsOffer] = useState([])
  const [skillsNeed, setSkillsNeed] = useState([])

  const canNext = () => {
    if (step === 0) return name.trim().length >= 2
    if (step === 1) return likes.length >= 1
    if (step === 2) return dislikes.length >= 1
    if (step === 3) return feeling !== null
    if (step === 4) return skillsOffer.length >= 1
    return true
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await addNewUser({
        name: name.trim(),
        likes,
        dislikes,
        feeling,
        skills_offer: skillsOffer,
        skills_need: skillsNeed
      })
      onClose()
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const progress = ((step) / (STEPS.length - 1)) * 100

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 100
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(480px, calc(100vw - 48px))',
          background: 'rgba(12, 12, 30, 0.98)',
          border: '1px solid rgba(124,77,255,0.35)',
          borderRadius: 20,
          boxShadow: '0 0 80px rgba(124,77,255,0.2), 0 32px 64px rgba(0,0,0,0.7)',
          zIndex: 110,
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.07)' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7c4dff, #4fc3f7)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  style={{
                    width: i === step ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i <= step
                      ? '#7c4dff'
                      : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
            <h2
              className="font-space"
              style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}
            >
              {step === 0 && 'Who are you?'}
              {step === 1 && 'What do you love?'}
              {step === 2 && 'What drives you crazy?'}
              {step === 3 && 'How are you feeling?'}
              {step === 4 && 'What can you offer?'}
              {step === 5 && 'What do you need?'}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Step 0: Name */}
          {step === 0 && (
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 10
              }}>
                Your Name
              </label>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canNext() && handleNext()}
                placeholder="e.g. Alex Chen"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 16,
                  fontFamily: 'Space Grotesk, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.15s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,77,255,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
              <p style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>
                This is how you'll appear as a star on the map.
              </p>
            </div>
          )}

          {/* Step 1: Likes */}
          {step === 1 && (
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 10
              }}>
                Things you love
              </label>
              <TagInput
                tags={likes}
                setTags={setLikes}
                placeholder="e.g. coffee, hiking, anime..."
                max={5}
                accentColor="#a5d6a7"
              />
            </div>
          )}

          {/* Step 2: Dislikes */}
          {step === 2 && (
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 10
              }}>
                Things that annoy you
              </label>
              <TagInput
                tags={dislikes}
                setTags={setDislikes}
                placeholder="e.g. group projects, loud chewing..."
                max={5}
                accentColor="#ef9a9a"
              />
            </div>
          )}

          {/* Step 3: Feeling */}
          {step === 3 && (
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 14
              }}>
                Right now, I&apos;m feeling...
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {FEELINGS.map(f => (
                  <button
                    key={f.label}
                    onClick={() => setFeeling(f.label)}
                    style={{
                      padding: '14px 10px',
                      borderRadius: 12,
                      border: feeling === f.label
                        ? '2px solid rgba(124,77,255,0.7)'
                        : '1px solid rgba(255,255,255,0.1)',
                      background: feeling === f.label
                        ? 'rgba(124,77,255,0.2)'
                        : 'rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => {
                      if (feeling !== f.label) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (feeling !== f.label) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{f.emoji}</span>
                    <span style={{
                      fontSize: 12,
                      color: feeling === f.label ? '#ce93d8' : 'rgba(255,255,255,0.5)',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Skills offer */}
          {step === 4 && (
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 10
              }}>
                Skills you can share
              </label>
              <TagInput
                tags={skillsOffer}
                setTags={setSkillsOffer}
                placeholder="e.g. Python, music production..."
                max={3}
                accentColor="#90caf9"
              />
            </div>
          )}

          {/* Step 5: Skills need */}
          {step === 5 && (
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 10
              }}>
                Skills you&apos;re looking for
              </label>
              <TagInput
                tags={skillsNeed}
                setTags={setSkillsNeed}
                placeholder="e.g. design, cooking..."
                max={3}
                accentColor="#ffe082"
              />
            </div>
          )}

          {error && (
            <p style={{
              marginTop: 12,
              fontSize: 13,
              color: '#ef9a9a',
              fontFamily: 'Inter, sans-serif'
            }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              color: 'rgba(255,255,255,0.5)',
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
            }}
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>

          <button
            onClick={handleNext}
            disabled={!canNext() || submitting}
            style={{
              padding: '10px 28px',
              background: canNext() && !submitting
                ? 'linear-gradient(135deg, #7c4dff, #5e35b1)'
                : 'rgba(124,77,255,0.3)',
              border: 'none',
              borderRadius: 10,
              color: canNext() && !submitting ? '#fff' : 'rgba(255,255,255,0.4)',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: canNext() && !submitting ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {submitting ? (
              <>
                <div style={{
                  width: 14,
                  height: 14,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Creating…
              </>
            ) : step === STEPS.length - 1 ? (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0L9.2 5.8L15 8L9.2 10.2L8 16L6.8 10.2L1 8L6.8 5.8L8 0Z" fill="white" />
                </svg>
                Launch My Star
              </>
            ) : (
              'Next →'
            )}
          </button>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  )
}
