// Title, description and canonical path for every app route in the sitemap.
//
// Read twice: by each page's <Seo>, and by scripts/prerender-routes.mjs, which
// writes dist/<route>/index.html with these tags already in the head. Crawlers
// and link unfurlers that skip JavaScript otherwise saw the homepage's title
// and canonical on every route. Plain data: the build script imports it.
export const ROUTE_META = {
  '/': {
    title: 'DoAide Khata — Free Digital Udhar Khata App for Shopkeepers | डिजिटल खाता',
    description:
      'Free digital udhar khata for Indian shopkeepers. Track who owes you, send WhatsApp payment reminders with UPI links, make GST bills, export PDF. Hindi + English, no login needed.',
    path: '/',
  },
  '/bill': {
    title: 'Free GST Bill Maker for Shopkeepers — PDF Invoice & Receipt | DoAide Khata',
    description:
      'Make a GST bill or cash receipt in seconds: CGST/SGST or IGST calculated automatically, download PDF, share on WhatsApp with a UPI payment link. Free, no login.',
    path: '/bill',
  },
  '/summary': {
    title: 'Daily Summary & Profit-Loss — DoAide Khata | दैनिक सारांश',
    description:
      'See day-by-day collection, udhar given and net cash for your shop, month by month. Export your full khata summary as a PDF. Free, no login.',
    path: '/summary',
  },
  '/reports': {
    title: 'Reports & Analytics — DoAide Khata',
    description:
      'Monthly and yearly reports with charts for your shop khata. Track income, expenses, and category-wise breakdown.',
    path: '/reports',
  },
  '/help': {
    title: 'Help & FAQ — How to use the digital udhar khata | DoAide Khata',
    description:
      'How to record udhar, send WhatsApp payment reminders with UPI, add entries by voice, make GST bills and back up your khata. हिंदी में भी।',
    path: '/help',
  },
  '/settings': {
    title: 'Settings — Shop details, UPI & backup | DoAide Khata',
    description:
      'Set your shop name, GSTIN and UPI ID for payment reminders and bills. Back up your khata or sign in with Google to sync across phones.',
    path: '/settings',
  },
  '/tools/whatsapp-reminder': {
    title: 'Free WhatsApp Payment Reminder Message Generator (Hindi & English) | DoAide Khata',
    description:
      'Write a polite udhar payment reminder for your customer in Hindi or English, with a UPI pay link, and send it on WhatsApp in one tap. Free, no login.',
    path: '/tools/whatsapp-reminder',
  },
}
