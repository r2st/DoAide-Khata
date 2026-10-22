import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ErrorBoundary from '../components/ErrorBoundary'
import { api, isOfflineError } from '../lib/api'
import { lazyPage } from '../lib/lazyPage'
import { todayISO } from '../lib/format'
import { ruleParse } from '../lib/parse'
import { monthRange, shiftMonth } from '../pages/Summary'
import { DATA_KEY } from '../state/KhataContext'
import { customer, customer as customerRow, renderApp, tx as txRow } from './utils'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ruleParse (offline quick entry)', () => {
  it('reads name, amount and udhar', () => {
    expect(ruleParse('Ramesh ko 500 udhar diya', [])).toMatchObject({ customer_name: 'Ramesh', type: 'gave', amount: 500 })
  })
  it('treats payment words as received and matches known customers', () => {
    expect(ruleParse('Sita se ₹1,250 mile', ['Sita Devi', 'Sita'])).toMatchObject({ customer_name: 'Sita', type: 'received', amount: 1250 })
  })
  it('handles Devanagari text and digits', () => {
    expect(ruleParse('रमेश को ५०० रुपये उधार दिया', [])).toMatchObject({ customer_name: 'रमेश', type: 'gave', amount: 500 })
  })
  it('prefers a rupee amount over other numbers', () => {
    expect(ruleParse('Mohan ko 2 kg chawal rs 90 diya', []).amount).toBe(90)
  })
  it('returns null amount when there is none', () => {
    expect(ruleParse('hello', []).amount).toBeNull()
  })
})

describe('api errors', () => {
  it('turns a dropped connection into a status-0 error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const err = await api.config().catch((e) => e)
    expect(err.status).toBe(0)
    expect(isOfflineError(err)).toBe(true)
  })
  it('turns an abort into a timeout error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' })))
    const err = await api.config().catch((e) => e)
    expect(err.status).toBe(408)
  })
  it('keeps the server detail on HTTP errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Too many requests' }), { status: 429 })))
    const err = await api.config().catch((e) => e)
    expect(err.message).toBe('Too many requests')
    expect(isOfflineError(err)).toBe(false)
  })
})

describe('quick entry offline', () => {
  it('falls back to the on-device parser when the API is unreachable', async () => {
    vi.spyOn(api, 'parse').mockRejectedValue(Object.assign(new Error('offline'), { status: 0 }))
    renderApp('/', { state: { customers: [customer('a', 'Ramesh')], transactions: [], bills: [], settings: {} } })
    fireEvent.change(screen.getByRole('textbox', { name: /Quick entry/ }), { target: { value: 'Ramesh ko 750 udhar diya' } })
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(await screen.findByLabelText('Amount (₹)')).toHaveValue(750)
    expect(screen.queryByText(/Couldn't understand/)).not.toBeInTheDocument()
  })
})

describe('lazyPage', () => {
  it('renders synchronously after preload', async () => {
    const Page = lazyPage(() => Promise.resolve({ default: () => <p>loaded page</p> }))
    await Page.preload()
    render(<Page />)
    expect(screen.getByText('loaded page')).toBeInTheDocument()
  })
})

describe('ErrorBoundary', () => {
  it('shows a recovery screen instead of a blank page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const Boom = () => {
      throw new Error('boom')
    }
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download backup/ })).toBeInTheDocument()
  })
})

describe('offline banner', () => {
  it('tells the shopkeeper the khata still works offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    renderApp('/')
    expect(screen.getByText(/You are offline/)).toBeInTheDocument()
  })
})

describe('WhatsApp reminder tool (no login)', () => {
  const fill = () => {
    fireEvent.change(screen.getByLabelText('Customer name'), { target: { value: 'Suresh' } })
    fireEvent.change(screen.getByLabelText('Amount due (₹)'), { target: { value: '1200' } })
    fireEvent.change(screen.getByLabelText('Your UPI ID (optional)'), { target: { value: 'shop@okaxis' } })
    fireEvent.change(screen.getByLabelText('Message language'), { target: { value: 'en' } })
  }

  it('builds a reminder with a UPI link and a WhatsApp send link', () => {
    renderApp('/tools/whatsapp-reminder')
    expect(screen.getByRole('heading', { level: 1, name: /reminder maker/i })).toBeInTheDocument()
    expect(screen.getByText(/Enter the customer name and amount/)).toBeInTheDocument()
    fill()
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '9876543210' } })
    const preview = screen.getByTestId('reminder-preview')
    expect(preview).toHaveTextContent('Reminder: ₹1,200 outstanding')
    expect(preview).toHaveTextContent('upi://pay?pa=shop%40okaxis')
    const send = screen.getByRole('link', { name: /Send on WhatsApp/ })
    expect(send.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/)
  })

  it('writes the message in Hindi when chosen', () => {
    renderApp('/tools/whatsapp-reminder')
    fill()
    fireEvent.change(screen.getByLabelText('Message language'), { target: { value: 'hi' } })
    expect(screen.getByTestId('reminder-preview')).toHaveTextContent('बाकी है')
  })

  it('flags an invalid UPI ID and hides the message', () => {
    renderApp('/tools/whatsapp-reminder')
    fill()
    fireEvent.change(screen.getByLabelText('Your UPI ID (optional)'), { target: { value: 'not-a-upi' } })
    expect(screen.getByText(/UPI ID looks incorrect/)).toBeInTheDocument()
    expect(screen.queryByTestId('reminder-preview')).not.toBeInTheDocument()
  })

  it('saves the udhar to the khata and opens the customer', async () => {
    renderApp('/tools/whatsapp-reminder')
    fill()
    fireEvent.click(screen.getByRole('button', { name: /Save to my khata/ }))
    expect(await screen.findByRole('heading', { name: 'Suresh' })).toBeInTheDocument()
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(DATA_KEY))
      expect(saved.transactions[0]).toMatchObject({ type: 'gave', amount: 1200 })
      expect(saved.settings.upiId).toBe('shop@okaxis')
    })
  })

  it('is linked from the empty khata', () => {
    renderApp('/')
    expect(screen.getByRole('link', { name: /Try the reminder maker/ })).toHaveAttribute('href', '/tools/whatsapp-reminder')
  })
})

describe('daily summary page', () => {
  it('shows day rows, month totals and the net direction', async () => {
    const today = todayISO()
    renderApp('/summary', {
      state: {
        customers: [customerRow('a', 'Ramesh')],
        transactions: [txRow('1', 'a', 'gave', 500, today), txRow('2', 'a', 'received', 200, today)],
        bills: [],
        settings: {},
      },
    })
    expect(await screen.findByTestId('summary-month')).toBeInTheDocument()
    expect(screen.getByText('Month total')).toBeInTheDocument()
    expect(screen.getAllByText('₹500').length).toBeGreaterThan(0)
    expect(screen.getAllByText('-₹300').length).toBeGreaterThan(0)
    expect(screen.getByText(/You gave more udhar than you received/)).toBeInTheDocument()
  })

  it('tells the shopkeeper when the month is empty', async () => {
    renderApp('/summary')
    expect(await screen.findByText(/No entries this month/)).toBeInTheDocument()
  })

  it('moves between months', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(monthRange('2026-02')).toEqual({ from: '2026-02-01', to: '2026-02-28' })
  })
})
