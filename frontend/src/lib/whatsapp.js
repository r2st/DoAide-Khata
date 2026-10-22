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
          `Reminder: ${shop} में आपका ${due} बाकी है।`,
          link ? `UPI से भुगतान करें: ${link}` : 'कृपया जल्द भुगतान करें।',
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

export function whatsappLink(phone, text) {
  const number = normalizePhone(phone)
  const query = `text=${encodeURIComponent(text)}`
  return number ? `https://wa.me/${number}?${query}` : `https://wa.me/?${query}`
}
