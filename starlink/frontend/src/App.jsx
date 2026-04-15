import { useEffect, useState } from 'react'
import useStore from './store.js'
import { seedDatabase } from './api.js'
import Landing from './components/Landing.jsx'
import StarMap from './components/StarMap.jsx'
import ConnectionPanel from './components/ConnectionPanel.jsx'
import StatsOverlay from './components/StatsOverlay.jsx'
import FilterBar from './components/FilterBar.jsx'
import CreateStar from './components/CreateStar.jsx'
import SkillExchange from './components/SkillExchange.jsx'

export default function App() {
  const [showMap, setShowMap] = useState(false)
  const [openCreateOnMap, setOpenCreateOnMap] = useState(false)
  const { loadData, users, isLoading, showCreateForm, setShowCreateForm, showSkillExchange } = useStore()

  useEffect(() => {
    const init = async () => {
      await loadData()
      const currentUsers = useStore.getState().users
      if (!currentUsers || currentUsers.length === 0) {
        try {
          await seedDatabase()
          await loadData()
        } catch (err) {
          console.error('Seed failed:', err)
        }
      }
    }
    init()
  }, [])

  const handleEnterMap = () => {
    setShowMap(true)
  }

  const handleCreateStar = () => {
    setShowMap(true)
    setOpenCreateOnMap(true)
    setShowCreateForm(true)
  }

  if (!showMap) {
    return (
      <Landing
        onEnterMap={handleEnterMap}
        onCreateStar={handleCreateStar}
      />
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0a0a1a', overflow: 'hidden' }}>
      <StarMap />

      {/* Overlays */}
      <StatsOverlay />
      <FilterBar />
      <ConnectionPanel />

      {/* Skill Exchange panel */}
      {showSkillExchange && <SkillExchange />}

      {/* Create form modal */}
      {showCreateForm && (
        <CreateStar onClose={() => setShowCreateForm(false)} />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,10,26,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                border: '2px solid rgba(124,77,255,0.3)',
                borderTop: '2px solid #7c4dff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}
            />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
              Mapping the constellation…
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
