// Last-write-wins merge, same rules as backend/app/engines/merge.py. Used to fold a
// sync response into local state without losing edits made while the request was in flight.

const ts = (r) => (typeof r?.updatedAt === 'number' ? r.updatedAt : 0)

export function mergeRecords(a = [], b = []) {
  const map = new Map()
  for (const r of [...a, ...b]) {
    if (!r || typeof r.id !== 'string') continue
    const current = map.get(r.id)
    if (!current || ts(r) >= ts(current)) map.set(r.id, r)
  }
  return [...map.values()]
}

export function mergeLedgers(base, incoming) {
  return {
    ...base,
    customers: mergeRecords(base.customers, incoming.customers),
    transactions: mergeRecords(base.transactions, incoming.transactions),
    bills: mergeRecords(base.bills, incoming.bills),
    settings: ts(incoming.settings) > ts(base.settings) ? incoming.settings : base.settings,
  }
}
