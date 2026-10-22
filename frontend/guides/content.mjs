// Static SEO guides, rendered to dist/guides by scripts/build-guides.mjs.
// When adding a guide, also add /guides/<slug> to ROUTES in backend/app/routers/seo.py.

export const site = {
  name: 'DoAide Khata',
  url: 'https://khata.doaide.com',
  lang: 'en-IN',
  color: '#047857',
  umamiId: '0c91ac92-49a3-44a1-b07e-fc92a04a853e',
  nav: [
    ['/', 'Open Khata'],
    ['/guides', 'Guides'],
    ['/help', 'Help'],
  ],
  footer:
    'DoAide Khata is a free digital udhar khata for Indian shopkeepers. Also from DoAide: <a href="https://gst.doaide.com">GST calculator</a> · <a href="https://tax.doaide.com">income tax calculators</a> · <a href="https://comply.doaide.com">compliance calendar</a>',
  indexTitle: 'Udhar Khata Guides for Shopkeepers | DoAide Khata',
  indexH1: 'Udhar khata guides for shopkeepers',
  indexDescription:
    'Practical guides for kirana and retail shop owners: keeping an udhar ledger, collecting payments on WhatsApp and UPI, and choosing a free khata app.',
  indexCta: 'Open your free khata — no login needed',
}

const app = ['/', 'Start your free udhar khata — no signup']

export const guides = [
  {
    slug: 'best-free-udhar-khata-app',
    title: 'Best Free Udhar Khata App for Shopkeepers in 2026 (No Login) | DoAide Khata',
    h1: 'Best free udhar khata app for shopkeepers in 2026',
    description:
      'What to look for in a free digital udhar khata / bahi khata app in 2026: WhatsApp reminders, UPI links, Hindi support, backups and GST bills. Plus a no-signup option.',
    updated: '2026-10-22',
    intro: `<p>Almost every kirana store, medical shop and hardware dealer in India runs on <strong>udhar</strong> — regular customers take goods today and pay at the end of the week or month. For decades that credit lived in a paper <em>bahi khata</em>. Paper works, but it gets lost, smudged or disputed, and it can’t send a reminder for you.</p>
<p>A digital udhar khata app fixes that. This guide explains what actually matters when you pick one, so you can choose based on your shop rather than on advertising.</p>`,
    sections: [
      [
        'why-digital',
        'Why move your udhar khata from paper to phone',
        `<ul>
<li><strong>Every customer’s balance in one tap.</strong> No flipping pages to find what Sharma ji owes.</li>
<li><strong>Fewer disputes.</strong> Each entry has a date, amount and note. You can share a statement instead of arguing over memory.</li>
<li><strong>Faster collection.</strong> A polite WhatsApp reminder with a UPI link gets paid much faster than a verbal “bhaiya, hisaab kar dena”.</li>
<li><strong>Nothing lost.</strong> A backed-up digital khata survives a wet register or a misplaced diary.</li>
</ul>`,
      ],
      [
        'features',
        'Features that matter (and ones that don’t)',
        `<table>
<thead><tr><th>Feature</th><th>Why it matters</th></tr></thead>
<tbody>
<tr><td>Gave / Got entries (दिए / मिले)</td><td>The two buttons you will press 50 times a day. They must be big and fast.</td></tr>
<tr><td>Running balance per customer</td><td>You should see “₹2,350 baaki” without doing maths.</td></tr>
<tr><td>WhatsApp reminder with UPI link</td><td>The customer can pay from the reminder itself in GPay, PhonePe or Paytm.</td></tr>
<tr><td>Hindi + English</td><td>Useful when staff or family also make entries.</td></tr>
<tr><td>Voice entry</td><td>Saying “Ramesh ko 500 udhar diya” is quicker than typing during rush hour.</td></tr>
<tr><td>Backup / sync</td><td>A new phone or a cleared browser should not wipe your khata.</td></tr>
<tr><td>GST bill</td><td>Handy when a business customer asks for a proper invoice.</td></tr>
<tr><td>PDF statement</td><td>Lets you settle accounts with a customer in one message.</td></tr>
</tbody></table>
<p>Things that matter less than marketing suggests: loans offered inside the app, “credit scores” for your customers, and heavy inventory modules if you only want to track udhar.</p>`,
      ],
      [
        'privacy',
        'Signup, privacy and where your data lives',
        `<p>Many khata apps require your mobile number and OTP before you can make a single entry, and your customers’ names and numbers sit on their servers. Ask three questions before you commit:</p>
<ol>
<li>Can I use it without creating an account?</li>
<li>Can I export or back up my data myself?</li>
<li>Is it a heavy app download, or does it work in the browser?</li>
</ol>
<p><a href="/">DoAide Khata</a> works in your phone’s browser with no signup. Entries are saved on your phone; if you want a backup and sync across phones, you can sign in with Google, or download a backup file from <a href="/settings">Settings</a>.</p>`,
      ],
      [
        'how-to-start',
        'How to start in 5 minutes',
        `<ol>
<li>Open <a href="/">khata.doaide.com</a> and add your top 10 udhar customers with their mobile numbers.</li>
<li>For each, enter the current balance from your paper register as one “Gave” entry with the note “opening balance”.</li>
<li>Add your UPI ID in <a href="/settings">Settings</a> so reminders carry a payment link.</li>
<li>From tomorrow, record each new udhar and payment as it happens.</li>
<li>At month end, send reminders to everyone with a balance — one tap each.</li>
</ol>
<p>Keep the paper register for a few weeks in parallel if that gives you confidence, then retire it.</p>`,
      ],
    ],
    faqs: [
      ['Is there a completely free udhar khata app?', 'Yes. DoAide Khata is free for udhar entries, WhatsApp reminders, GST bills and PDF statements, and it works in the browser without signup.'],
      ['Do I need to download an app?', 'No. DoAide Khata runs in the phone browser. You can add it to your home screen so it opens like an app.'],
      ['Is digital khata data safe?', 'With DoAide Khata your entries stay on your phone unless you sign in with Google for backup and sync. You can also download a backup file from Settings at any time.'],
      ['Can I use the khata in Hindi?', 'Yes. Switch between Hindi and English with one tap from the header.'],
    ],
    cta: app,
  },
  {
    slug: 'whatsapp-payment-reminder-message',
    title: 'WhatsApp Payment Reminder Messages for Customers (Hindi & English) | DoAide Khata',
    h1: 'How to send a payment reminder on WhatsApp to customers (with message templates)',
    description:
      'Polite WhatsApp payment reminder messages in Hindi and English for shopkeepers, when to send them, and how to add a UPI link so customers can pay instantly.',
    updated: '2026-10-22',
    intro: `<p>Collecting udhar is the least favourite part of running a shop. You don’t want to sound rude to a customer who has shopped with you for years, but you also can’t let ₹40,000 sit outstanding across 30 people. A short, polite WhatsApp message with a UPI payment link solves most of it.</p>`,
    sections: [
      [
        'rules',
        'Five rules for reminders that get paid',
        `<ol>
<li><strong>Be specific.</strong> State the exact amount and the date of the last entry.</li>
<li><strong>Make paying effortless.</strong> Include a UPI link or your UPI ID so they can pay from the message.</li>
<li><strong>Pick the right time.</strong> 1st–7th of the month (salary days) and weekend mornings work best. Avoid late night.</li>
<li><strong>Stay warm.</strong> “Namaste”, their name and “dhanyavaad” go a long way.</li>
<li><strong>Escalate gently.</strong> First a friendly note, then a reminder after a week, then a phone call.</li>
</ol>`,
      ],
      [
        'hindi-templates',
        'Hindi reminder message templates',
        `<p><strong>Friendly first reminder</strong></p>
<blockquote>नमस्ते रमेश जी 🙏 आपके खाते में ₹1,250 बाकी हैं (आखिरी एंट्री 12 अक्टूबर)। सुविधा हो तो इस लिंक से UPI पर भुगतान कर दीजिए: [UPI लिंक]। धन्यवाद — शर्मा किराना</blockquote>
<p><strong>Second reminder after a week</strong></p>
<blockquote>नमस्ते रमेश जी, याद दिलाना था कि ₹1,250 अभी बाकी हैं। आज या कल तक भुगतान हो जाए तो बहुत अच्छा रहेगा। UPI: [लिंक]। धन्यवाद 🙏</blockquote>
<p><strong>Roman Hindi (Hinglish)</strong></p>
<blockquote>Namaste Ramesh ji, aapke khate mein ₹1,250 baaki hain. Is link se UPI payment kar dijiye: [link]. Dhanyavaad — Sharma Kirana</blockquote>`,
      ],
      [
        'english-templates',
        'English reminder message templates',
        `<blockquote>Hello Mr. Rao, a gentle reminder that ₹3,400 is due on your account at Balaji Medicals (last entry 5 Oct). You can pay instantly here: [UPI link]. Thank you!</blockquote>
<blockquote>Hi Priya, your balance with us is ₹860. Please clear it when convenient using this UPI link: [link]. Thanks for shopping with us.</blockquote>`,
      ],
      [
        'upi-link',
        'How to add a UPI payment link to the message',
        `<p>A UPI link looks like <code>upi://pay?pa=yourname@okbank&amp;pn=Shop%20Name&amp;am=1250&amp;cu=INR</code>. When the customer taps it on their phone, GPay, PhonePe, Paytm or BHIM opens with the amount pre-filled.</p>
<p>Typing this by hand is error-prone. In <a href="/">DoAide Khata</a>, add your UPI ID once in <a href="/settings">Settings</a>; then open any customer and tap <strong>Remind</strong>. WhatsApp opens with the due amount and a ready UPI link in Hindi or English — you just press send.</p>`,
      ],
      [
        'when-to-call',
        'When a message isn’t enough',
        `<p>If two reminders over two weeks get no response, call. Offer to split the amount (“₹500 aaj, baaki agle hafte”) — partial payment is better than none. Record each part payment as a “Got” entry so the balance stays accurate, and share a PDF statement if they dispute the total.</p>`,
      ],
    ],
    faqs: [
      ['How do I write a polite payment reminder in Hindi?', 'Greet the customer by name, state the exact amount due and the last entry date, add a UPI link, and thank them. For example: “नमस्ते रमेश जी, आपके खाते में ₹1,250 बाकी हैं। इस लिंक से UPI पर भुगतान कर दीजिए। धन्यवाद।”'],
      ['Can I send a UPI payment link on WhatsApp?', 'Yes. A upi://pay link with your UPI ID and amount opens the customer’s UPI app with the amount filled in. DoAide Khata builds this link for you automatically.'],
      ['How often should I send udhar reminders?', 'Once at the start of the month, and a follow-up a week later. More often than that tends to annoy regular customers.'],
      ['Is sending reminders from DoAide Khata free?', 'Yes. It opens WhatsApp on your phone with the message ready, so there is no SMS cost either.'],
    ],
    cta: ['/', 'Send your first WhatsApp reminder free'],
  },
  {
    slug: 'how-to-maintain-udhar-khata-kirana',
    title: 'How to Maintain an Udhar Khata (Credit Ledger) for a Kirana Store | DoAide Khata',
    h1: 'How to maintain an udhar khata (credit ledger) for a kirana store',
    description:
      'A simple system for keeping a clean udhar / bahi khata at a kirana or retail shop: credit limits, daily entries, month-end settlement and avoiding bad debts.',
    updated: '2026-10-22',
    intro: `<p>Udhar builds loyalty — the family that buys on credit from you won’t walk to the supermarket. But unmanaged udhar quietly eats your working capital. Here is a simple routine that shop owners across India use to keep credit under control.</p>`,
    sections: [
      [
        'basics',
        'The basics: what every entry needs',
        `<p>Each line in your khata should have four things:</p>
<ul>
<li><strong>Customer</strong> — name and mobile number (the number is what makes reminders possible).</li>
<li><strong>Date</strong></li>
<li><strong>Type</strong> — <em>Gave</em> (दिए, udhar given) or <em>Got</em> (मिले, payment received).</li>
<li><strong>Amount and a short note</strong> — “atta 10kg + oil”, “cash”, “UPI”.</li>
</ul>
<p>The balance is simply total Gave minus total Got. A digital khata works this out after every entry, so you never re-add a page.</p>`,
      ],
      [
        'limits',
        'Set a credit limit for each customer',
        `<p>Decide a comfortable maximum per customer based on how long they’ve shopped with you and how reliably they pay:</p>
<table>
<thead><tr><th>Customer type</th><th>Suggested limit</th><th>Settlement</th></tr></thead>
<tbody>
<tr><td>New, under 3 months</td><td>₹500–1,000</td><td>Weekly</td></tr>
<tr><td>Regular family</td><td>₹2,000–5,000</td><td>Monthly, by the 7th</td></tr>
<tr><td>Small business (tea stall, tiffin service)</td><td>Agreed in advance</td><td>Weekly or fortnightly</td></tr>
</tbody></table>
<p>When someone crosses their limit, collect part of the balance before giving more credit. Being consistent avoids awkwardness.</p>`,
      ],
      [
        'daily',
        'Daily and monthly routine',
        `<p><strong>Every day</strong>: record each udhar and payment at the counter, not from memory at night. Voice entry helps during rush hour.</p>
<p><strong>Every Sunday</strong>: scan the customer list sorted by balance and check who is close to their limit.</p>
<p><strong>1st of the month</strong>: send a WhatsApp reminder with a UPI link to everyone with a balance. See our <a href="/guides/whatsapp-payment-reminder-message">reminder message templates</a>.</p>
<p><strong>10th of the month</strong>: call anyone who hasn’t paid. Offer a part-payment plan.</p>`,
      ],
      [
        'bad-debt',
        'Avoiding bad debts',
        `<ul>
<li>Don’t give fresh udhar to someone with a balance older than 60 days.</li>
<li>Share a PDF statement when there is a dispute — dated entries end most arguments.</li>
<li>Track your <strong>total outstanding</strong>. If it is more than one or two weeks of sales, you are funding customers with money your wholesaler wants.</li>
</ul>`,
      ],
      [
        'gst',
        'Udhar, bills and GST',
        `<p>Udhar is a payment arrangement; it doesn’t change the GST on a sale. If you are GST-registered, issue a tax invoice for the sale as usual. <a href="/bill">DoAide Khata’s bill page</a> calculates CGST + SGST (or IGST for inter-state), makes a PDF, and can add the total straight to the customer’s khata. To check a rate, use the <a href="https://gst.doaide.com">free GST calculator</a>.</p>`,
      ],
    ],
    faqs: [
      ['What is an udhar khata?', 'An udhar khata (or bahi khata) is a ledger where a shopkeeper records goods given on credit to each customer and the payments received, so the outstanding balance is always known.'],
      ['How do I calculate a customer’s balance?', 'Add up everything given on credit and subtract the payments received. A digital khata like DoAide Khata does this automatically after every entry.'],
      ['How much udhar should a kirana store give?', 'Many shop owners keep total outstanding below one to two weeks of sales and set per-customer limits based on how reliably each customer pays.'],
      ['Can I move my old paper khata to a digital one?', 'Yes. Add each customer and enter their current balance as one opening entry, then record new transactions digitally from that day.'],
    ],
    cta: app,
  },
]
