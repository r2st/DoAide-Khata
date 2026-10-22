// Browser copy of backend/app/engines/parse.py rule_parse, so quick entry still
// pre-fills the form when the phone is offline or the API is unreachable.

const RECEIVED_WORDS = new Set([
  'received', 'receive', 'got', 'paid', 'payment', 'jama', 'mila', 'mile', 'mili', 'wapas', 'chukaya',
  'मिला', 'मिले', 'मिली', 'जमा', 'वापस', 'चुकाया',
])
const GAVE_WORDS = new Set([
  'gave', 'give', 'given', 'credit', 'udhar', 'udhaar', 'diya', 'diye', 'di', 'baki', 'baaki',
  'दिया', 'दिए', 'दी', 'उधार', 'बाकी',
])
const NOT_NAMES = new Set(['maine', 'mene', 'humne', 'aaj', 'kal', 'मैंने', 'हमने', 'आज', 'कल'])

const NUMBER = String.raw`\d[\d,]*(?:\.\d{1,2})?`
const MONEY = new RegExp(
  String.raw`(?:₹|\brs\.?|\binr)\s*(${NUMBER})|(${NUMBER})\s*(?:rs\b|rupees?\b|rupaye\b|rupay\b|रुपये|रुपए|रुपया)`,
  'i',
)
const NAME_BEFORE = /^\s*([^\d₹,]+?)\s+(?:ko|se|ne|को|से|ने)(?=\s|$)/iu

const devanagariDigits = (text) => text.replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x966))
const words = (text) => text.toLowerCase().match(/[\p{L}\p{M}\p{N}_]+/gu) || []
const toNumber = (raw) => Number(raw.replace(/,/g, ''))

export function matchCustomer(text, customers) {
  const lowered = text.toLowerCase()
  return [...customers].sort((a, b) => b.length - a.length).find((name) => name && lowered.includes(name.toLowerCase())) || null
}

function amountOf(text) {
  const money = text.match(MONEY)
  let raw = money && (money[1] || money[2])
  if (!raw) {
    const numbers = text.match(new RegExp(NUMBER, 'g'))
    if (!numbers) return null
    raw = numbers.reduce((best, n) => (toNumber(n) > toNumber(best) ? n : best))
  }
  const value = toNumber(raw)
  return value > 0 ? value : null
}

function guessName(text) {
  const m = text.match(NAME_BEFORE)
  if (!m) return null
  const parts = m[1].split(/\s+/).filter((w) => w && !NOT_NAMES.has(w.toLowerCase()))
  if (!parts.length || parts.length > 3) return null
  const name = parts.join(' ')
  return name[0].toUpperCase() + name.slice(1)
}

export function ruleParse(input, customers = []) {
  const text = devanagariDigits(input)
  const ws = words(text)
  let type = 'gave'
  if (ws.some((w) => RECEIVED_WORDS.has(w))) type = 'received'
  else if (ws.some((w) => GAVE_WORDS.has(w))) type = 'gave'
  else if (ws.includes('se') || ws.includes('से')) type = 'received'
  return {
    customer_name: matchCustomer(text, customers) || guessName(text),
    type,
    amount: amountOf(text),
    note: '',
    source: 'rules',
  }
}
