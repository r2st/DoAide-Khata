import { formatINR } from './format'

export function normalizePhone(phone = '') {
  let digits = String(phone).replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length === 10) digits = `91${digits}`
  return digits
}

export function isValidIndianMobile(phone = '') {
  return /^91[6-9]\d{9}$/.test(normalizePhone(phone))
}

export const isValidUpi = (upi = '') => /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upi.trim())

export function upiLink({ upiId, payeeName, amount, note }) {
  if (!upiId) return ''
  const params = new URLSearchParams({ pa: upiId.trim(), pn: payeeName || 'Shop', cu: 'INR' })
  if (amount > 0) params.set('am', Number(amount).toFixed(2))
  if (note) params.set('tn', note)
  return `upi://pay?${params.toString().replace(/\+/g, '%20')}`
}

export function reminderMessage({ lang = 'en', customerName, amount, shopName, upiId }) {
  const due = formatINR(amount)
  const shop = shopName || (lang === 'hi' ? 'हमारी दुकान' : 'our shop')
  const link = upiLink({ upiId, payeeName: shopName, amount, note: `Khata payment - ${customerName}` })
  const lines =
    lang === 'hi'
      ? [
          `नमस्ते ${customerName} जी 🙏`,
          `याद दिला रहे हैं: ${shop} में आपका ${due} बाकी है।`,
          link ? `UPI से भुगतान करें: ${link}` : 'कृपया जल्द भुगतान कर दें।',
          upiId ? `UPI ID: ${upiId}` : '',
          'धन्यवाद!',
        ]
      : [
          `Hello ${customerName} 🙏`,
          `Reminder: ${due} outstanding at ${shop}.`,
          link ? `Pay via UPI: ${link}` : 'Kindly clear the dues at the earliest.',
          upiId ? `UPI ID: ${upiId}` : '',
          'Thank you!',
        ]
  return [...lines.filter(Boolean), '', '— Sent via DoAide Khata'].join('\n')
}

// Sent right after an entry is saved, so the customer has a record of it.
export function entryMessage({ lang = 'en', customerName, type, amount, balance, date, shopName, upiId }) {
  const shop = shopName || (lang === 'hi' ? 'हमारी दुकान' : 'our shop')
  const gave = type === 'gave'
  const link = balance > 0 ? upiLink({ upiId, payeeName: shopName, amount: balance, note: `Khata payment - ${customerName}` }) : ''
  const lines =
    lang === 'hi'
      ? [
          `नमस्ते ${customerName} जी 🙏`,
          gave ? `${shop} से ${formatINR(amount)} का उधार लिखा गया (${date})।` : `${formatINR(amount)} का भुगतान मिल गया (${date}), धन्यवाद!`,
          balance > 0 ? `कुल बाकी: ${formatINR(balance)}` : balance < 0 ? `आपका ${formatINR(-balance)} एडवांस जमा है।` : 'हिसाब बराबर है ✅',
          link ? `UPI से भुगतान करें: ${link}` : '',
        ]
      : [
          `Hello ${customerName} 🙏`,
          gave ? `Udhar of ${formatINR(amount)} recorded at ${shop} (${date}).` : `Payment of ${formatINR(amount)} received (${date}). Thank you!`,
          balance > 0 ? `Total due: ${formatINR(balance)}` : balance < 0 ? `Advance with us: ${formatINR(-balance)}` : 'All dues cleared ✅',
          link ? `Pay via UPI: ${link}` : '',
        ]
  return [...lines.filter(Boolean), '', '— Sent via DoAide Khata'].join('\n')
}

export function appShareMessage(lang = 'en') {
  return lang === 'hi'
    ? 'मैं अपना उधार खाता DoAide Khata पर रखता हूँ — मुफ़्त, बिना लॉगिन, WhatsApp रिमाइंडर और UPI लिंक के साथ। आप भी आज़माएं: https://khata.doaide.com'
    : 'I keep my udhar khata on DoAide Khata — free, no login, with WhatsApp reminders and UPI links. Try it: https://khata.doaide.com'
}

export function whatsappLink(phone, text) {
  const number = normalizePhone(phone)
  const query = `text=${encodeURIComponent(text)}`
  return number ? `https://wa.me/${number}?${query}` : `https://wa.me/?${query}`
}
