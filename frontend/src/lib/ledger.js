import { daysBetween } from './format'

// Sign convention: balance > 0 means the customer owes the shop (lena hai);
// balance < 0 means the shop holds an advance (dena hai).

export const live = (records = []) => records.filter((r) => !r.deleted)

export function signedAmount(tx) {
  const amount = Number(tx.amount) || 0
  return tx.type === 'gave' ? amount : -amount
}

const byDate = (a, b) => (a.date === b.date ? (a.createdAt || 0) - (b.createdAt || 0) : a.date < b.date ? -1 : 1)

export function runningLedger(transactions, customerId) {
  let balance = 0
  return live(transactions)
    .filter((t) => t.customerId === customerId)
    .sort(byDate)
    .map((t) => {
      balance = round2(balance + signedAmount(t))
      return { ...t, balance }
    })
}

export function customerBalances(transactions) {
  const balances = {}
  for (const t of live(transactions)) {
    balances[t.customerId] = round2((balances[t.customerId] || 0) + signedAmount(t))
  }
  return balances
}

export function lastActivity(transactions) {
  const last = {}
  for (const t of live(transactions)) {
    if (!last[t.customerId] || t.date > last[t.customerId]) last[t.customerId] = t.date
  }
  return last
}

export function lastPayment(transactions) {
  const last = {}
  for (const t of live(transactions)) {
    if (t.type === 'received' && (!last[t.customerId] || t.date > last[t.customerId])) last[t.customerId] = t.date
  }
  return last
}

export function dashboard({ customers, transactions }, today, { top = 5, overdueDays = 30 } = {}) {
  const people = live(customers)
  const ids = new Set(people.map((c) => c.id))
  const txs = live(transactions).filter((t) => ids.has(t.customerId))
  const balances = customerBalances(txs)
  const paid = lastPayment(txs)
  const activity = lastActivity(txs)

  let totalOutstanding = 0
  let totalAdvance = 0
  for (const b of Object.values(balances)) {
    if (b > 0) totalOutstanding += b
    else totalAdvance -= b
  }

  const todays = txs.filter((t) => t.date === today)
  const sum = (list) => round2(list.reduce((s, t) => s + (Number(t.amount) || 0), 0))

  const debtors = people
    .map((c) => ({ ...c, balance: balances[c.id] || 0 }))
    .filter((c) => c.balance > 0)
    .sort((a, b) => b.balance - a.balance)

  const dueDates = {}
  for (const t of txs) {
    if (t.type === 'gave' && t.dueDate && (!dueDates[t.customerId] || t.dueDate < dueDates[t.customerId]))
      dueDates[t.customerId] = t.dueDate
  }

  const overdue = debtors
    .map((c) => {
      const due = dueDates[c.id]
      if (due && due <= today) return { ...c, since: due, days: daysBetween(due, today) }
      const since = paid[c.id] || activity[c.id]
      if (since && daysBetween(since, today) >= overdueDays) return { ...c, since, days: daysBetween(since, today) }
      return null
    })
    .filter(Boolean)

  return {
    totalOutstanding: round2(totalOutstanding),
    totalAdvance: round2(totalAdvance),
    todayCollection: sum(todays.filter((t) => t.type === 'received')),
    todayGiven: sum(todays.filter((t) => t.type === 'gave')),
    customerCount: people.length,
    debtorCount: debtors.length,
    topDebtors: debtors.slice(0, top),
    overdue,
  }
}

export function dailySummary(transactions, fromISO, toISO) {
  const byDay = {}
  for (const t of live(transactions)) {
    if (!t.date || t.date < fromISO || t.date > toISO) continue
    const day = (byDay[t.date] ||= { date: t.date, received: 0, given: 0 })
    const amount = Number(t.amount) || 0
    if (t.type === 'received') day.received = round2(day.received + amount)
    else day.given = round2(day.given + amount)
  }
  const days = Object.values(byDay)
    .map((d) => ({ ...d, net: round2(d.received - d.given) }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  let received = 0
  let given = 0
  for (const d of days) {
    received = round2(received + d.received)
    given = round2(given + d.given)
  }
  return { days, totals: { received, given, net: round2(received - given) } }
}

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}
