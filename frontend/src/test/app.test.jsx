import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '../lib/api'
import { DATA_KEY } from '../state/KhataContext'
import { customer, renderApp, tx } from './utils'

afterEach(() => vi.restoreAllMocks())

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

describe('khata flow', () => {
  it('adds a customer, records udhar and a payment, and shows the running balance', async () => {
    renderApp('/')
    expect(screen.getByText(/No customers yet/)).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /Add customer/ })[0])
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ramesh' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '98765 43210' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('heading', { name: 'Ramesh' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Gave ₹ (Udhar)' }))
    fireEvent.change(screen.getByLabelText('Amount (₹)'), { target: { value: '500' } })
    fireEvent.change(screen.getByLabelText('Note (items, bill no.)'), { target: { value: 'Atta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    fireEvent.click(screen.getByRole('button', { name: 'Got ₹ (Payment)' }))
    fireEvent.change(screen.getByLabelText('Amount (₹)'), { target: { value: '200' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    const balance = screen.getByTestId('ledger-balance')
    expect(within(balance).getByText('₹300')).toBeInTheDocument()
    expect(within(balance).getByText('You will get')).toBeInTheDocument()
    expect(screen.getByText('Atta')).toBeInTheDocument()
    expect(screen.getByText('Bal. ₹500')).toBeInTheDocument()

    const remind = screen.getByRole('link', { name: /Remind/ })
    expect(remind.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/)
    expect(decodeURIComponent(remind.getAttribute('href'))).toContain('Reminder: ₹300 outstanding')

    await waitFor(() => expect(JSON.parse(localStorage.getItem(DATA_KEY)).transactions).toHaveLength(2))
  })

  it('rejects an invalid phone number', () => {
    renderApp('/')
    fireEvent.click(screen.getAllByRole('button', { name: /Add customer/ })[0])
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'X' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('alert')).toHaveTextContent('valid 10-digit')
  })

  it('rejects a zero amount', () => {
    renderApp('/customer/a', { state: { customers: [customer('a', 'Ramesh')], transactions: [], bills: [], settings: {} } })
    fireEvent.click(screen.getByRole('button', { name: 'Gave ₹ (Udhar)' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('alert')).toHaveTextContent('greater than 0')
  })

  it('edits and deletes an entry', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderApp('/customer/a', {
      state: { customers: [customer('a', 'Ramesh')], transactions: [tx('t1', 'a', 'gave', 500, '2026-10-01')], bills: [], settings: {} },
    })
    fireEvent.click(screen.getByRole('button', { name: /You gave/ }))
    fireEvent.change(screen.getByLabelText('Amount (₹)'), { target: { value: '750' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(within(screen.getByTestId('ledger-balance')).getByText('₹750')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /You gave/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete entry' }))
    expect(within(screen.getByTestId('ledger-balance')).getByText('Settled')).toBeInTheDocument()
  })

  it('shows dashboard totals, top dues and search', () => {
    const t = today()
    renderApp('/', {
      state: {
        customers: [customer('a', 'Ramesh', '9876543210'), customer('b', 'Sita')],
        transactions: [tx('1', 'a', 'gave', 1000, t), tx('2', 'a', 'received', 300, t), tx('3', 'b', 'gave', 250, t)],
        bills: [],
        settings: {},
      },
    })
    expect(screen.getByTestId('total-outstanding')).toHaveTextContent('₹950')
    expect(screen.getByText("Today's collection").nextSibling).toHaveTextContent('₹300')
    expect(screen.getByText('Udhar given today').nextSibling).toHaveTextContent('₹1,250')
    expect(screen.getByText('Top dues')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Search name or phone'), { target: { value: '98765' } })
    const list = screen.getByRole('heading', { name: 'Customers (2)' }).closest('section')
    expect(within(list).getByText('Ramesh')).toBeInTheDocument()
    expect(within(list).queryByText('Sita')).not.toBeInTheDocument()
  })

  it('switches the UI to Hindi', () => {
    renderApp('/')
    fireEvent.click(screen.getByRole('button', { name: 'हिंदी' }))
    expect(screen.getByText('कुल लेना है')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
  })

  it('shows the DoAide badge', () => {
    renderApp('/')
    expect(screen.getByRole('link', { name: /A DoAide Product/ })).toHaveAttribute('href', 'https://doaide.com')
  })
})

describe('onboarding', () => {
  it('guides a first-time user, saves shop details and opens the add-customer form', () => {
    renderApp('/', { onboarding: true })
    const guide = screen.getByRole('dialog', { name: 'Welcome to DoAide Khata' })
    fireEvent.click(within(guide).getByRole('button', { name: 'English' }))
    expect(screen.getByText('How it works — 3 easy steps')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Next/ }))

    fireEvent.change(screen.getByLabelText('UPI ID (for payment links)'), { target: { value: 'bad' } })
    fireEvent.click(screen.getByRole('button', { name: /Add my first customer/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('UPI ID looks incorrect')

    fireEvent.change(screen.getByLabelText('Shop name'), { target: { value: 'Sharma Store' } })
    fireEvent.change(screen.getByLabelText('UPI ID (for payment links)'), { target: { value: 'sharma@okaxis' } })
    fireEvent.click(screen.getByRole('button', { name: /Add my first customer/ }))

    expect(screen.getByRole('dialog', { name: 'Add customer' })).toBeInTheDocument()
    expect(localStorage.getItem('khata:onboarded')).toBe('true')
    expect(JSON.parse(localStorage.getItem(DATA_KEY)).settings).toMatchObject({ shopName: 'Sharma Store', upiId: 'sharma@okaxis' })
  })

  it('can be skipped and is not shown to users who already have customers', () => {
    renderApp('/', { onboarding: true })
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    cleanup()
    localStorage.clear()
    renderApp('/', { onboarding: true, state: { customers: [customer('a', 'Ramesh')], transactions: [], bills: [], settings: {} } })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('fewer steps + WhatsApp', () => {
  it('saves a new customer with their old udhar in one go', async () => {
    renderApp('/')
    fireEvent.click(screen.getAllByRole('button', { name: /Add customer/ })[0])
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Geeta' } })
    fireEvent.change(screen.getByLabelText('Udhar given now ₹ (optional)'), { target: { value: '750' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('heading', { name: 'Geeta' })).toBeInTheDocument()
    expect(within(screen.getByTestId('ledger-balance')).getByText('₹750')).toBeInTheDocument()
    expect(screen.getByText('Old balance')).toBeInTheDocument()
  })

  it('offers to send a saved entry to the customer on WhatsApp', () => {
    renderApp('/customer/a', {
      state: { customers: [customer('a', 'Ramesh', '9876543210')], transactions: [tx('t1', 'a', 'gave', 500, '2026-10-01')], bills: [], settings: {} },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Got ₹ (Payment)' }))
    fireEvent.click(screen.getByRole('button', { name: '₹200' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    const send = screen.getByRole('link', { name: /Send to customer on WhatsApp/ })
    expect(send.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/)
    expect(decodeURIComponent(send.getAttribute('href'))).toContain('Payment of ₹200 received')
    expect(decodeURIComponent(send.getAttribute('href'))).toContain('Total due: ₹300')
  })

  it('lets you remind top debtors from the dashboard and nudges for a UPI ID', () => {
    renderApp('/', {
      state: { customers: [customer('a', 'Ramesh', '9876543210')], transactions: [tx('1', 'a', 'gave', 400, today())], bills: [], settings: {} },
    })
    const remind = screen.getByRole('link', { name: 'WhatsApp reminder to Ramesh' })
    expect(decodeURIComponent(remind.getAttribute('href'))).toContain('₹400 outstanding')
    expect(screen.getByRole('link', { name: 'Add UPI ID' })).toHaveAttribute('href', '/settings')
  })

  it('has a share-the-app link in the footer', () => {
    renderApp('/')
    const share = screen.getByRole('link', { name: /Share DoAide Khata on WhatsApp/ })
    expect(decodeURIComponent(share.getAttribute('href'))).toContain('https://khata.doaide.com')
  })
})

describe('quick entry', () => {
  it('turns a sentence into a prefilled entry and creates the customer', async () => {
    const parse = vi.spyOn(api, 'parse').mockResolvedValue({ customer_name: 'Mohan', type: 'gave', amount: 450, note: 'Chawal' })
    renderApp('/', { state: { customers: [customer('a', 'Ramesh')], transactions: [], bills: [], settings: {} } })

    fireEvent.change(screen.getByPlaceholderText('e.g. Ramesh ko 500 udhar diya'), { target: { value: 'Mohan ko 450 ka chawal udhar' } })
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))

    await screen.findByRole('dialog')
    expect(parse).toHaveBeenCalledWith('Mohan ko 450 ka chawal udhar', ['Ramesh'])
    expect(screen.getByLabelText('Customer')).toHaveValue('__new__')
    expect(screen.getByLabelText('Amount (₹)')).toHaveValue(450)
    expect(screen.getByLabelText('Note (items, bill no.)')).toHaveValue('Chawal')

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('heading', { name: 'Mohan' })).toBeInTheDocument()
    expect(within(screen.getByTestId('ledger-balance')).getByText('₹450')).toBeInTheDocument()
  })

  it('falls back to a blank form when parsing fails', async () => {
    vi.spyOn(api, 'parse').mockRejectedValue(new Error('offline'))
    renderApp('/', { state: { customers: [customer('a', 'Ramesh')], transactions: [], bills: [], settings: {} } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Ramesh ko 500 udhar diya'), { target: { value: 'something' } })
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(await screen.findByText(/Couldn't understand/)).toBeInTheDocument()
    expect(screen.getByLabelText('Customer')).toHaveValue('')
  })
})

describe('bill', () => {
  it('calculates GST, saves the bill, adds it to the khata and requests a PDF', async () => {
    const billPdf = vi.spyOn(api, 'billPdf').mockResolvedValue(new Blob(['%PDF']))
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    renderApp('/bill', {
      state: { customers: [customer('a', 'Ramesh', '9876543210')], transactions: [], bills: [], settings: { shopName: 'Sharma Store', upiId: 'shop@okaxis' } },
    })
    expect(screen.getByTestId('bill-number')).toHaveTextContent(`INV-${new Date().getFullYear()}-001`)

    fireEvent.change(screen.getByLabelText('Bill to'), { target: { value: 'a' } })
    fireEvent.change(screen.getByLabelText('Item name 1'), { target: { value: 'Atta' } })
    fireEvent.change(screen.getByLabelText('Qty 1'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Rate ₹ 1'), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText('GST % 1'), { target: { value: '18' } })

    const totals = screen.getByTestId('bill-totals')
    expect(within(totals).getByText('CGST').nextSibling).toHaveTextContent('₹18')
    expect(within(totals).getByText('Total').nextSibling).toHaveTextContent('₹236')

    const share = screen.getByRole('link', { name: /Share on WhatsApp/ })
    expect(decodeURIComponent(share.getAttribute('href'))).toContain('Atta × 2 = ₹236')

    fireEvent.click(screen.getByRole('button', { name: /Save & PDF/ }))
    await waitFor(() => expect(billPdf).toHaveBeenCalled())
    expect(billPdf.mock.calls[0][0]).toMatchObject({ customer: { name: 'Ramesh' }, items: [{ name: 'Atta', qty: 2, rate: 100, gstRate: 18 }] })
    expect(await screen.findByText(/Bill saved/)).toBeInTheDocument()
    expect(screen.getByTestId('bill-number')).toHaveTextContent('-002')
    const sendSaved = screen.getByRole('link', { name: /Send this bill on WhatsApp/ })
    expect(decodeURIComponent(sendSaved.getAttribute('href'))).toContain('Atta × 2 = ₹236')
    expect(screen.getByRole('link', { name: /Send INV-.*-001 on WhatsApp/ })).toBeInTheDocument()

    const saved = JSON.parse(localStorage.getItem(DATA_KEY))
    expect(saved.transactions[0]).toMatchObject({ customerId: 'a', type: 'gave', amount: 236 })
  })

  it('requires at least one complete item', () => {
    renderApp('/bill')
    fireEvent.click(screen.getByRole('button', { name: /Save & PDF/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('at least one item')
  })
})

describe('settings', () => {
  it('validates and saves shop details', async () => {
    vi.spyOn(api, 'config').mockResolvedValue({ googleClientId: '', aiEnabled: false })
    renderApp('/settings')
    fireEvent.change(screen.getByLabelText('UPI ID (for payment links)'), { target: { value: 'not-a-upi' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }))
    expect(screen.getByRole('status')).toHaveTextContent('UPI ID looks incorrect')

    fireEvent.change(screen.getByLabelText('UPI ID (for payment links)'), { target: { value: 'sharma@okaxis' } })
    fireEvent.change(screen.getByLabelText('Shop name'), { target: { value: 'Sharma Store' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }))
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
    await waitFor(() => expect(JSON.parse(localStorage.getItem(DATA_KEY)).settings).toMatchObject({ shopName: 'Sharma Store', upiId: 'sharma@okaxis' }))
    expect(await screen.findByText(/Google sign-in is not available/)).toBeInTheDocument()
  })

  it('restores a backup file by merging it in', async () => {
    vi.spyOn(api, 'config').mockResolvedValue({ googleClientId: '' })
    renderApp('/settings')
    const backup = { app: 'doaide-khata', customers: [customer('z', 'Zoya')], transactions: [], bills: [], settings: {} }
    const file = new File([JSON.stringify(backup)], 'b.json', { type: 'application/json' })
    fireEvent.change(screen.getByTestId('restore-input'), { target: { files: [file] } })
    expect(await screen.findByText('Backup restored')).toBeInTheDocument()
    await waitFor(() => expect(JSON.parse(localStorage.getItem(DATA_KEY)).customers[0].name).toBe('Zoya'))
  })
})

describe('help', () => {
  it('renders the FAQ', () => {
    renderApp('/help')
    expect(screen.getByRole('heading', { name: 'Help & FAQ' })).toBeInTheDocument()
    expect(screen.getByText('Do I need to sign up?')).toBeInTheDocument()
  })
})
