// GST bill math in integer paise. Mirrors backend/app/engines/gst.py.

export const GST_RATES = [0, 3, 5, 12, 18, 28]

const toPaise = (rupees) => Math.round(Number((rupees * 100).toPrecision(12)))

export function computeBill(items, interState = false) {
  let taxable = 0
  let cgst = 0
  let sgst = 0
  let igst = 0
  const lines = items.map((item) => {
    const qty = Number(item.qty) || 0
    const rate = Number(item.rate) || 0
    const gstRate = Number(item.gstRate) || 0
    const lineTaxable = toPaise(qty * rate)
    const tax = Math.round(Number(((lineTaxable * gstRate) / 100).toPrecision(12)))
    if (interState) {
      igst += tax
    } else {
      const half = Math.round(tax / 2)
      cgst += half
      sgst += tax - half
    }
    taxable += lineTaxable
    return { ...item, qty, rate, gstRate, taxable: lineTaxable / 100, tax: tax / 100, total: (lineTaxable + tax) / 100 }
  })
  return {
    lines,
    taxable: taxable / 100,
    cgst: cgst / 100,
    sgst: sgst / 100,
    igst: igst / 100,
    total: (taxable + cgst + sgst + igst) / 100,
  }
}

export function nextBillNumber(bills = [], date = new Date()) {
  const prefix = `INV-${date.getFullYear()}-`
  const max = bills
    .map((b) => (b.number?.startsWith(prefix) ? Number(b.number.slice(prefix.length)) : 0))
    .reduce((a, b) => Math.max(a, b || 0), 0)
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

export function isValidGSTIN(gstin = '') {
  return /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin.trim().toUpperCase())
}
