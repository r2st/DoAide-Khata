import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { api } from '../lib/api'
import { newId, todayISO } from '../lib/format'
import { mergeLedgers } from '../lib/merge'
import { readJSON, removeKey, writeJSON } from '../lib/storage'

export const DATA_KEY = 'khata:v1'
export const AUTH_KEY = 'khata:auth'

export const emptyState = { customers: [], transactions: [], bills: [], settings: {} }

export function reducer(state, action) {
  const now = action.now ?? Date.now()
  const patchById = (list, id, patch) => list.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: now } : r))
  switch (action.type) {
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.customer] }
    case 'UPDATE_CUSTOMER':
      return { ...state, customers: patchById(state.customers, action.id, action.patch) }
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: patchById(state.customers, action.id, { deleted: true }),
        transactions: state.transactions.map((t) =>
          t.customerId === action.id && !t.deleted ? { ...t, deleted: true, updatedAt: now } : t,
        ),
      }
    case 'ADD_TX':
      return { ...state, transactions: [...state.transactions, action.tx] }
    case 'UPDATE_TX':
      return { ...state, transactions: patchById(state.transactions, action.id, action.patch) }
    case 'DELETE_TX':
      return { ...state, transactions: patchById(state.transactions, action.id, { deleted: true }) }
    case 'SAVE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings, updatedAt: now } }
    case 'ADD_BILL':
      return { ...state, bills: [...state.bills, action.bill] }
    case 'MERGE':
      return mergeLedgers(state, action.doc)
    default:
      return state
  }
}

function loadState() {
  const saved = readJSON(DATA_KEY, null)
  if (!saved || typeof saved !== 'object') return emptyState
  return {
    customers: Array.isArray(saved.customers) ? saved.customers : [],
    transactions: Array.isArray(saved.transactions) ? saved.transactions : [],
    bills: Array.isArray(saved.bills) ? saved.bills : [],
    settings: saved.settings && typeof saved.settings === 'object' ? saved.settings : {},
  }
}

const KhataContext = createContext(null)

export function KhataProvider({ children, initialState }) {
  const [state, rawDispatch] = useReducer(reducer, initialState, (init) => init || loadState())
  const [auth, setAuth] = useState(() => readJSON(AUTH_KEY, null))
  const [sync, setSync] = useState({ status: 'idle', lastSync: null })
  const dirty = useRef(true)
  const stateRef = useRef(state)
  stateRef.current = state

  const dispatch = useCallback((action) => {
    if (action.type !== 'MERGE') dirty.current = true
    rawDispatch(action)
  }, [])

  useEffect(() => {
    writeJSON(DATA_KEY, state)
  }, [state])

  // Without sign-in the browser is the only copy, so ask it not to evict our storage
  // once there is something worth keeping.
  const hasData = state.customers.length > 0
  useEffect(() => {
    if (hasData) globalThis.navigator?.storage?.persist?.().catch(() => {})
  }, [hasData])

  const signOut = useCallback(() => {
    removeKey(AUTH_KEY)
    setAuth(null)
    setSync({ status: 'idle', lastSync: null })
  }, [])

  const syncNow = useCallback(async () => {
    if (!auth?.token) return
    dirty.current = false
    setSync((s) => ({ ...s, status: 'syncing' }))
    try {
      const merged = await api.sync(auth.token, stateRef.current)
      rawDispatch({ type: 'MERGE', doc: merged })
      setSync({ status: 'idle', lastSync: new Date() })
    } catch (e) {
      dirty.current = true
      if (e.status === 401) signOut()
      else setSync((s) => ({ ...s, status: 'error' }))
    }
  }, [auth, signOut])

  // Push local edits shortly after they happen while signed in.
  useEffect(() => {
    if (!auth?.token || !dirty.current) return
    const timer = setTimeout(syncNow, 1500)
    return () => clearTimeout(timer)
  }, [state, auth, syncNow])

  const signIn = useCallback(async (credential) => {
    const session = await api.googleLogin(credential)
    writeJSON(AUTH_KEY, session)
    dirty.current = true
    setAuth(session)
  }, [])

  const actions = useMemo(
    () => ({
      addCustomer({ name, phone = '' }) {
        const now = Date.now()
        const customer = { id: newId(), name: name.trim(), phone: phone.trim(), createdAt: now, updatedAt: now }
        dispatch({ type: 'ADD_CUSTOMER', customer })
        return customer
      },
      updateCustomer: (id, patch) => dispatch({ type: 'UPDATE_CUSTOMER', id, patch }),
      deleteCustomer: (id) => dispatch({ type: 'DELETE_CUSTOMER', id }),
      addTransaction({ customerId, type, amount, note = '', date = todayISO() }) {
        const now = Date.now()
        const tx = { id: newId(), customerId, type, amount: Number(amount), note: note.trim(), date, createdAt: now, updatedAt: now }
        dispatch({ type: 'ADD_TX', tx })
        return tx
      },
      updateTransaction: (id, patch) => dispatch({ type: 'UPDATE_TX', id, patch }),
      deleteTransaction: (id) => dispatch({ type: 'DELETE_TX', id }),
      saveSettings: (settings) => dispatch({ type: 'SAVE_SETTINGS', settings }),
      addBill(bill) {
        const now = Date.now()
        const saved = { ...bill, id: newId(), createdAt: now, updatedAt: now }
        dispatch({ type: 'ADD_BILL', bill: saved })
        return saved
      },
      importBackup(doc) {
        dirty.current = true
        rawDispatch({ type: 'MERGE', doc })
      },
    }),
    [dispatch],
  )

  const value = useMemo(
    () => ({ state, ...actions, auth, signIn, signOut, sync, syncNow }),
    [state, actions, auth, signIn, signOut, sync, syncNow],
  )
  return <KhataContext.Provider value={value}>{children}</KhataContext.Provider>
}

export function useKhata() {
  const ctx = useContext(KhataContext)
  if (!ctx) throw new Error('useKhata must be used inside KhataProvider')
  return ctx
}
