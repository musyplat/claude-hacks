const BASE = '/api'

export const fetchUsers = () =>
  fetch(`${BASE}/users`).then(r => r.json())

export const fetchConnections = () =>
  fetch(`${BASE}/connections`).then(r => r.json())

export const fetchConnectionsForUser = (id) =>
  fetch(`${BASE}/connections/user/${id}`).then(r => r.json())

export const fetchConnectionDetail = (id) =>
  fetch(`${BASE}/connections/${id}`).then(r => r.json())

export const fetchStats = () =>
  fetch(`${BASE}/stats`).then(r => r.json())

export const createUser = (data) =>
  fetch(`${BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json())

export const proposeExchange = (data) =>
  fetch(`${BASE}/exchanges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json())

export const seedDatabase = () =>
  fetch(`${BASE}/seed`, { method: 'POST' }).then(r => r.json())

export const fetchCohorts = () =>
  fetch(`${BASE}/cohorts`).then(r => r.json())

export const joinCohort = (access_code, user_id) =>
  fetch(`${BASE}/cohorts/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_code, user_id }),
  }).then(r => r.json())
