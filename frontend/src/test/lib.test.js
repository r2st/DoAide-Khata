import { describe, expect, it } from 'vitest'
import { daysBetween, formatINR, initials, todayISO } from '../lib/format'
import { computeBill, isValidGSTIN, nextBillNumber } from '../lib/gst'
import { STRINGS, translate } from '../lib/i18n'
import { customerBalances, dashboard, runningLedger } from '../lib/ledger'
import { mergeLedgers, mergeRecords } from '../lib/merge'
import { entryMessage, isValidIndianMobile, isValidUpi, normalizePhone, reminderMessage, upiLink, whatsappLink } from '../lib/whatsapp'
import { reducer, emptyState } from '../state/KhataContext'
import { customer, tx } from './utils'

describe('format', () => {
  it('formats rupees in Indian grouping', () => {
    expect(formatINR(1234567)).toBe('₹12,34,567')
    expect(formatINR(-500.5)).toBe('-₹500.5')
  })
  it('gives local ISO dates and day gaps', () => {
    expect(todayISO(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(daysBetween('2026-01-01', '2026-03-01')).toBe(59)
  })
  it('builds initials', () => {
    expect(initials('ramesh kumar')).toBe('RK')
    expect(initials('')).toBe('?')
  })
})

describe('ledger', () => {
  const txs = [
    tx('t3', 'a', 'received', 200, '2026-10-03'),
    tx('t1', 'a', 'gave', 500, '2026-10-01'),
    tx('t2', 'a', 'gave', 100.1, '2026-10-02'),
    tx('t4', 'b', 'received', 50, '2026-10-02'),
    tx('t5', 'a', 'gave', 999, '2026-10-02', { deleted: true }),
  ]

  it('computes running balance oldest-first and skips deleted', () => {
    expect(runningLedger(txs, 'a').map((r) => r.balance)).toEqual([500, 600.1, 400.1])
  })

  it('orders same-day entries by creation time', () => {
    const rows = runningLedger(
      [tx('x', 'a', 'received', 10, '2026-10-01', { createdAt: 5 }), tx('y', 'a', 'gave', 30, '2026-10-01', { createdAt: 2 })],
      'a',
    )
    expect(rows.map((r) => r.id)).toEqual(['y', 'x'])
  })

  it('computes per-customer balances (negative = advance)', () => {
    expect(customerBalances(txs)).toEqual({ a: 400.1, b: -50 })
  })

  it('builds the dashboard', () => {
    const state = {
      customers: [customer('a', 'Ramesh'), customer('b', 'Sita'), customer('c', 'Gone', '')],
      transactions: [...txs, tx('t6', 'c', 'gave', 1000, '2026-10-03')],
    }
    state.customers[2].deleted = true
    const d = dashboard(state, '2026-10-03')
    expect(d.totalOutstanding).toBe(400.1)
    expect(d.totalAdvance).toBe(50)
    expect(d.todayCollection).toBe(200)
    expect(d.todayGiven).toBe(0)
    expect(d.customerCount).toBe(2)
    expect(d.topDebtors.map((c) => c.id)).toEqual(['a'])
  })

  it('flags dues with no payment for 30+ days', () => {
    const state = {
      customers: [customer('a', 'Old'), customer('b', 'Recent')],
      transactions: [tx('1', 'a', 'gave', 100, '2026-08-01'), tx('2', 'b', 'gave', 100, '2026-08-01'), tx('3', 'b', 'received', 10, '2026-10-01')],
    }
    const d = dashboard(state, '2026-10-03')
    expect(d.overdue.map((c) => [c.id, c.days])).toEqual([['a', 63]])
  })
})

describe('whatsapp', () => {
  it('normalizes Indian numbers', () => {
    expect(normalizePhone('098765 43210')).toBe('919876543210')
    expect(normalizePhone('+91 98765-43210')).toBe('919876543210')
    expect(isValidIndianMobile('9876543210')).toBe(true)
    expect(isValidIndianMobile('12345')).toBe(false)
    expect(isValidIndianMobile('1234567890')).toBe(false)
  })

  it('builds a UPI deep link', () => {
    expect(upiLink({ upiId: 'shop@okaxis', payeeName: 'Sharma Store', amount: 500, note: 'Khata' })).toBe(
      'upi://pay?pa=shop%40okaxis&pn=Sharma%20Store&cu=INR&am=500.00&tn=Khata',
    )
    expect(upiLink({ upiId: '' })).toBe('')
  })

  it('writes the reminder in English and Hindi', () => {
    const en = reminderMessage({ customerName: 'Ramesh', amount: 500, shopName: 'Sharma Store', upiId: 'shop@okaxis' })
    expect(en).toContain('Reminder: ₹500 outstanding at Sharma Store.')
    expect(en).toContain('Pay via UPI: upi://pay?pa=shop%40okaxis')
    const hi = reminderMessage({ lang: 'hi', customerName: 'रमेश', amount: 500, shopName: 'शर्मा स्टोर' })
    expect(hi).toContain('₹500 बाकी है')
    expect(hi).not.toContain('upi://')
  })

  it('builds wa.me links with and without a number', () => {
    expect(whatsappLink('9876543210', 'hi there')).toBe('https://wa.me/919876543210?text=hi%20there')
    expect(whatsappLink('', 'x')).toBe('https://wa.me/?text=x')
  })
})

describe('entry message', () => {
  it('confirms a payment with the remaining balance and a UPI link', () => {
    const msg = entryMessage({ customerName: 'Ramesh', type: 'received', amount: 200, balance: 300, date: '1 Oct 2026', shopName: 'Sharma Store', upiId: 'shop@okaxis' })
    expect(msg).toContain('Payment of ₹200 received')
    expect(msg).toContain('Total due: ₹300')
    expect(msg).toContain('upi://pay?pa=shop%40okaxis')
  })
  it('says dues are cleared in Hindi and skips the UPI link', () => {
    const msg = entryMessage({ lang: 'hi', customerName: 'रमेश', type: 'received', amount: 500, balance: 0, date: '1 अक्टू॰', upiId: 'shop@okaxis' })
    expect(msg).toContain('हिसाब बराबर')
    expect(msg).not.toContain('upi://')
  })
  it('validates UPI IDs', () => {
    expect(isValidUpi('sharma@okaxis')).toBe(true)
    expect(isValidUpi('not-a-upi')).toBe(false)
  })
})

describe('gst', () => {
  it('matches the backend examples', () => {
    expect(computeBill([{ name: 'Rice', qty: 2, rate: 100, gstRate: 5 }])).toMatchObject({ taxable: 200, cgst: 5, sgst: 5, igst: 0, total: 210 })
    expect(computeBill([{ name: 'Phone', qty: 1, rate: 1000, gstRate: 18 }], true)).toMatchObject({ igst: 180, total: 1180 })
    const odd = computeBill([{ name: 'x', qty: 1, rate: 10.1, gstRate: 5 }])
    expect(odd.cgst + odd.sgst).toBeCloseTo(0.51)
    expect(odd.total).toBe(10.61)
  })

  it('numbers bills per year', () => {
    const now = new Date(2026, 5, 1)
    expect(nextBillNumber([], now)).toBe('INV-2026-001')
    expect(nextBillNumber([{ number: 'INV-2026-009' }, { number: 'INV-2025-050' }], now)).toBe('INV-2026-010')
  })

  it('validates GSTIN format', () => {
    expect(isValidGSTIN('09ABCDE1234F1Z5')).toBe(true)
    expect(isValidGSTIN('09ABCDE1234F1X5')).toBe(false)
  })
})

describe('merge', () => {
  it('keeps the newest version of each record', () => {
    expect(mergeRecords([{ id: 'a', v: 1, updatedAt: 1 }], [{ id: 'a', v: 2, updatedAt: 2 }, { id: 'b', updatedAt: 1 }])).toEqual([
      { id: 'a', v: 2, updatedAt: 2 },
      { id: 'b', updatedAt: 1 },
    ])
  })
  it('does not let an older server copy clobber a newer local edit', () => {
    const local = { ...emptyState, customers: [{ id: 'a', name: 'New', updatedAt: 5 }], settings: { shopName: 'L', updatedAt: 5 } }
    const server = { customers: [{ id: 'a', name: 'Old', updatedAt: 1 }], transactions: [], bills: [], settings: { shopName: 'S', updatedAt: 1 } }
    const merged = mergeLedgers(local, server)
    expect(merged.customers[0].name).toBe('New')
    expect(merged.settings.shopName).toBe('L')
  })
})

describe('reducer', () => {
  it('soft-deletes a customer and their entries', () => {
    const state = { ...emptyState, customers: [customer('a', 'R')], transactions: [tx('1', 'a', 'gave', 5, '2026-01-01'), tx('2', 'b', 'gave', 5, '2026-01-01')] }
    const next = reducer(state, { type: 'DELETE_CUSTOMER', id: 'a', now: 99 })
    expect(next.customers[0]).toMatchObject({ deleted: true, updatedAt: 99 })
    expect(next.transactions.map((t) => !!t.deleted)).toEqual([true, false])
  })
  it('stamps updates', () => {
    const state = { ...emptyState, transactions: [tx('1', 'a', 'gave', 5, '2026-01-01')] }
    expect(reducer(state, { type: 'UPDATE_TX', id: '1', patch: { amount: 7 }, now: 50 }).transactions[0]).toMatchObject({ amount: 7, updatedAt: 50 })
  })
})

describe('i18n', () => {
  it('has every key in both languages', () => {
    expect(Object.keys(STRINGS.hi).sort()).toEqual(Object.keys(STRINGS.en).sort())
  })
  it('interpolates variables', () => {
    expect(translate('hi', 'customers.title', { n: 3 })).toBe('ग्राहक (3)')
    expect(translate('en', 'missing.key')).toBe('missing.key')
  })
})
