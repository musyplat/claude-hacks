import { create } from 'zustand'
import {
  fetchUsers,
  fetchConnections,
  fetchConnectionsForUser,
  fetchConnectionDetail,
  fetchStats,
  createUser,
  seedDatabase
} from './api.js'

const useStore = create((set, get) => ({
  users: [],
  connections: [],
  stats: null,
  selectedUser: null,
  selectedConnection: null,
  userConnections: [],
  filterMode: 'all',
  hoveredUserId: null,
  hoveredLineId: null,
  isLoading: true,
  showCreateForm: false,
  showSkillExchange: false,

  loadData: async () => {
    set({ isLoading: true })
    try {
      const [users, connections, stats] = await Promise.all([
        fetchUsers(),
        fetchConnections(),
        fetchStats()
      ])
      set({
        users: Array.isArray(users) ? users : [],
        connections: Array.isArray(connections) ? connections : [],
        stats: stats || null,
        isLoading: false
      })
    } catch (err) {
      console.error('Failed to load data:', err)
      set({ isLoading: false })
    }
  },

  selectUser: async (user) => {
    set({ selectedUser: user, selectedConnection: null, userConnections: [] })
    try {
      const conns = await fetchConnectionsForUser(user.id)
      set({ userConnections: Array.isArray(conns) ? conns : [] })
    } catch (err) {
      console.error('Failed to load user connections:', err)
    }
  },

  selectConnection: async (connId) => {
    try {
      const detail = await fetchConnectionDetail(connId)
      set({ selectedConnection: detail })
    } catch (err) {
      console.error('Failed to load connection detail:', err)
    }
  },

  clearSelection: () => {
    set({ selectedUser: null, selectedConnection: null, userConnections: [] })
  },

  setFilter: (mode) => {
    set({ filterMode: mode })
  },

  setHovered: (id) => {
    set({ hoveredUserId: id })
  },

  setHoveredLine: (id) => {
    set({ hoveredLineId: id })
  },

  setShowCreateForm: (val) => {
    set({ showCreateForm: val })
  },

  setShowSkillExchange: (val) => {
    set({ showSkillExchange: val })
  },

  addNewUser: async (userData) => {
    try {
      const newUser = await createUser(userData)
      // Refresh users and connections
      const [users, connections] = await Promise.all([
        fetchUsers(),
        fetchConnections()
      ])
      set({
        users: Array.isArray(users) ? users : [],
        connections: Array.isArray(connections) ? connections : [],
        showCreateForm: false,
        selectedUser: newUser
      })
      return newUser
    } catch (err) {
      console.error('Failed to create user:', err)
      throw err
    }
  }
}))

export default useStore
