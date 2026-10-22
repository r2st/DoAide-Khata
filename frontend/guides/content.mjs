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
    ['/tools/whatsapp-reminder', 'Reminder maker'],
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
  {
    slug: 'digital-bahi-khata-vs-paper-ledger',
    title: 'Digital Bahi Khata vs Paper Ledger: Which Is Better for Your Shop? | DoAide Khata',
    h1: 'Digital bahi khata vs paper ledger: which is better for your shop?',
    description:
      'An honest comparison of a paper bahi khata and a digital khata app for Indian shopkeepers: cost, speed, disputes, collections, backups, privacy, and how to switch without losing a single entry.',
    updated: '2026-10-22',
    intro: `<p>The red cloth-bound <em>bahi khata</em> has kept Indian shops running for generations. Many shopkeepers still trust it more than any phone. Others have moved their udhar to an app and never looked back. Both groups have good reasons.</p>
<p>This guide compares a paper ledger and a digital khata honestly — where paper still wins, where digital clearly wins, and how to switch without losing a single entry if you decide to.</p>`,
    sections: [
      [
        'at-a-glance',
        'Paper vs digital at a glance',
        `<table>
<thead><tr><th></th><th>Paper bahi khata</th><th>Digital khata app</th></tr></thead>
<tbody>
<tr><td>Cost</td><td>₹100–300 per register</td><td>Free apps exist, including <a href="/">DoAide Khata</a></td></tr>
<tr><td>Making an entry</td><td>Pen and page; quick once you know the page</td><td>Two taps, or speak it with voice entry</td></tr>
<tr><td>Customer balance</td><td>Add up the page by hand</td><td>Shown instantly after every entry</td></tr>
<tr><td>Reminders</td><td>Phone call or in person</td><td>WhatsApp message with amount and UPI link</td></tr>
<tr><td>Disputes</td><td>Your word against theirs</td><td>Dated entries and a PDF statement to share</td></tr>
<tr><td>Loss and damage</td><td>Water, fire, termites, a misplaced register</td><td>Backups and sync if you turn them on</td></tr>
<tr><td>Works without power or internet</td><td>Always</td><td>Needs a charged phone; many apps work offline</td></tr>
<tr><td>Learning curve</td><td>None</td><td>A day or two</td></tr>
</tbody></table>`,
      ],
      [
        'paper-wins',
        'Where the paper ledger still wins',
        `<ul>
<li><strong>No phone, no problem.</strong> A register never runs out of battery, never needs an update and works in a power cut.</li>
<li><strong>Anyone can use it.</strong> An elderly parent or a new helper can write in it without learning anything.</li>
<li><strong>Customers trust what they can see.</strong> Some customers like watching the entry being written and signing next to it.</li>
<li><strong>It is private by default.</strong> Nobody outside the shop sees it.</li>
</ul>
<p>If you give udhar to fewer than ten customers and they pay reliably, a paper register may be all you need.</p>`,
      ],
      [
        'digital-wins',
        'Where a digital khata clearly wins',
        `<p><strong>1. Collections.</strong> This is the big one. Most udhar is not lost to bad customers; it is lost to forgetting. A digital khata shows everyone with a balance in one list, sorted by amount, and lets you send each of them a polite WhatsApp reminder with a UPI payment link in one tap. Shop owners who switch usually say collections are where they feel the difference first. See our <a href="/guides/whatsapp-payment-reminder-message">reminder message templates</a>.</p>
<p><strong>2. No arithmetic errors.</strong> A page of 40 entries added by hand at 10 pm will have a mistake sooner or later. The app recalculates the balance after every entry.</p>
<p><strong>3. Fewer arguments.</strong> When a customer says “I paid ₹500 last week”, you can scroll to the exact date. If they still disagree, send a statement — dated entries settle most disputes calmly.</p>
<p><strong>4. Nothing is lost.</strong> A register that gets wet in the monsoon takes months of udhar with it. With backup turned on, a lost or broken phone does not mean lost money.</p>
<p><strong>5. You see the whole business.</strong> Your total outstanding udhar is one number at the top of the screen. If it is more than one or two weeks of sales, you know it is time to collect before giving more credit.</p>`,
      ],
      [
        'worries',
        'Common worries about going digital',
        `<p><strong>“What if my phone is lost?”</strong> Turn on backup. In DoAide Khata you can sign in with Google to sync across phones, or download a backup file from <a href="/settings">Settings</a> and keep it safe.</p>
<p><strong>“Is my customers’ data safe?”</strong> Ask any app where the data lives. DoAide Khata keeps entries on your phone unless you choose to sign in for sync, and it needs no signup to start.</p>
<p><strong>“My customers won’t like it.”</strong> Most customers prefer it: they get a clear message with the amount and can pay from their UPI app without visiting the shop.</p>
<p><strong>“I’m not good with phones.”</strong> A good khata app has just two big buttons — <em>Gave</em> (दिए) and <em>Got</em> (मिले) — and works in Hindi. If you can send a WhatsApp message, you can use it.</p>`,
      ],
      [
        'switch',
        'How to switch from paper to digital in one evening',
        `<ol>
<li>Open <a href="/">khata.doaide.com</a> on your phone — no download or signup needed — and add it to your home screen.</li>
<li>Go through your register and add each customer with a balance, with their mobile number.</li>
<li>Enter each customer’s current balance as one <em>Gave</em> entry with the note “opening balance from register”.</li>
<li>Add your UPI ID in <a href="/settings">Settings</a> so every reminder carries a payment link.</li>
<li>From the next morning, record each new udhar and payment on the phone at the counter.</li>
<li>Keep the paper register in the drawer for a month. Once the app balances match what you expect, retire it.</li>
</ol>
<p>Many shops keep a hybrid for a while — paper at the counter during rush hour and entries typed in at closing. That is fine, as long as everything reaches the app the same day. For a full daily and monthly routine, read <a href="/guides/how-to-maintain-udhar-khata-kirana">how to maintain an udhar khata</a>.</p>`,
      ],
      [
        'verdict',
        'The verdict',
        `<p>If udhar is a small part of your business, paper is fine. If you give credit to more than a dozen customers, if collections take your time every month, or if a lost register would hurt, a free digital khata pays for itself in the first month — because it costs nothing and brings money in faster. You don’t have to choose forever: try it alongside your register for a few weeks and decide for yourself.</p>
<p>Comparing apps? Read <a href="/guides/best-free-udhar-khata-app">what to look for in a free udhar khata app</a>.</p>`,
      ],
    ],
    faqs: [
      ['Is a digital bahi khata legally valid?', 'A khata is a private record of credit between you and your customer, and dated electronic records are generally accepted as evidence in India. For tax purposes, keep proper bills and books as your accountant advises.'],
      ['Can I use a digital khata without internet?', 'DoAide Khata saves entries on your phone, so you can keep recording in the shop even when the connection is weak. Reminders need WhatsApp, which needs internet.'],
      ['Will I lose data if I change my phone?', 'Not if you turn on backup. Sign in with Google to sync, or download a backup file from Settings before you switch phones.'],
      ['Should I keep my paper register after switching?', 'Keep it for a few weeks until you are confident the balances in the app are right, then store it safely as an old record.'],
    ],
    cta: app,
  },
  {
    slug: 'upi-payments-for-kirana-shops',
    title: 'UPI Payments for Kirana Shops: QR Code, Payment Links and Udhar Collection | DoAide Khata',
    h1: 'UPI payments for kirana shops: QR codes, payment links and collecting udhar',
    description:
      'A practical guide to accepting UPI at a kirana or small shop: merchant QR vs personal UPI ID, charges, soundboxes, payment links for udhar, matching payments to customers, and avoiding fake-payment frauds.',
    updated: '2026-10-22',
    intro: `<p>UPI has become the default way to pay at Indian shops. Customers who would once have said “baad mein de dunga” can now pay from their phone in seconds, and that changes how you handle udhar too.</p>
<p>This guide covers what a small shop owner needs to know: how to set up UPI properly, what it costs, how to use payment links to collect udhar, how to keep payments matched to the right customer, and how to avoid the common frauds.</p>`,
    sections: [
      [
        'setup',
        'Personal UPI ID vs merchant QR: which should you use?',
        `<table>
<thead><tr><th></th><th>Personal UPI ID</th><th>Merchant (business) QR</th></tr></thead>
<tbody>
<tr><td>Setup</td><td>Already have one</td><td>Free from GPay for Business, PhonePe Business, Paytm for Business or your bank</td></tr>
<tr><td>Shows shop name to customer</td><td>No, shows your personal name</td><td>Yes</td></tr>
<tr><td>Payment alerts / soundbox</td><td>Phone notification only</td><td>Business app alerts; soundbox available</td></tr>
<tr><td>Separate business records</td><td>Mixed with personal payments</td><td>Clear statement of shop payments</td></tr>
</tbody></table>
<p>For a shop, a merchant QR is worth the ten minutes it takes to set up. Customers see your shop name, which builds trust, and your shop payments stay separate from personal transfers — useful at month end and if you ever apply for a business loan.</p>`,
      ],
      [
        'charges',
        'Does UPI cost the shopkeeper anything?',
        `<p>For normal UPI payments from a customer’s bank account to your shop, there is no merchant discount rate (MDR) — the fee card machines charge — under current government policy. Some cases can carry charges, such as payments made using a credit card linked to UPI at larger merchants, or optional services like a rented soundbox. Check the terms of your payment app or bank before signing up for any paid add-on.</p>`,
      ],
      [
        'udhar-links',
        'Using UPI payment links to collect udhar',
        `<p>The QR on your counter only works when the customer is in the shop. For udhar, you need the payment to reach the customer at home. That is what a UPI payment link does.</p>
<p>A UPI link looks like <code>upi://pay?pa=yourshop@okbank&amp;pn=Sharma%20Kirana&amp;am=1250&amp;cu=INR</code>. When the customer taps it on their phone, GPay, PhonePe, Paytm or BHIM opens with your shop name and the amount already filled in. They just enter their PIN.</p>
<p>Building these links by hand for 30 customers is tedious. In <a href="/">DoAide Khata</a>, add your UPI ID once in <a href="/settings">Settings</a>; then open any customer and tap <strong>Remind</strong>. WhatsApp opens with the balance and a ready-made UPI link in Hindi or English. For wording ideas, see our <a href="/guides/whatsapp-payment-reminder-message">WhatsApp reminder templates</a>.</p>`,
      ],
      [
        'matching',
        'Matching UPI payments to the right customer',
        `<p>The most common problem with UPI udhar payments is not collecting the money — it is remembering who paid. A payment from “R K Verma” in your app may be Ramesh’s son paying Ramesh’s account.</p>
<ul>
<li><strong>Record it the moment you see it.</strong> When the payment alert comes, open the customer in your khata and add a <em>Got</em> entry with the note “UPI”.</li>
<li><strong>Ask customers to add a note.</strong> A UPI payment can carry a remark — ask regular customers to type their name or “khata”.</li>
<li><strong>Reconcile weekly.</strong> Once a week, compare the UPI app’s statement with the <em>Got</em> entries in your khata. Anything unmatched, call and ask.</li>
<li><strong>Record part payments as they come.</strong> ₹500 now and ₹750 next week are two separate <em>Got</em> entries; the balance updates automatically.</li>
</ul>`,
      ],
      [
        'fraud',
        'Avoiding UPI frauds at the counter',
        `<ul>
<li><strong>Fake payment screenshots.</strong> Never accept a screenshot as proof. Wait for your own app notification or soundbox announcement, or check your bank balance.</li>
<li><strong>“I sent extra by mistake, please return it.”</strong> Check your actual statement before refunding anything. Requests to “approve” a collect request to receive money are always fraud — you never enter your PIN to receive money.</li>
<li><strong>Swapped QR stickers.</strong> Check your printed QR every morning; fraudsters sometimes paste their own over it.</li>
<li><strong>Calls claiming to be from your bank or payment app.</strong> No genuine bank asks for your UPI PIN or OTP.</li>
</ul>`,
      ],
      [
        'gst',
        'UPI, bills and GST',
        `<p>UPI is just a way of paying; it does not change the GST on a sale. If you are GST-registered, issue a proper bill whether the customer pays in cash, UPI or on udhar. <a href="/bill">DoAide Khata’s bill page</a> makes a GST bill with CGST + SGST (or IGST), and can add the total to the customer’s khata. To check a rate, use the <a href="https://gst.doaide.com">free GST rate finder</a>.</p>`,
      ],
    ],
    faqs: [
      ['Is there a charge for accepting UPI payments at my shop?', 'Normal UPI payments from a customer’s bank account carry no merchant discount rate under current policy. Optional add-ons like a rented soundbox, or some credit-card-on-UPI payments, may cost extra.'],
      ['How can I send a UPI payment link on WhatsApp?', 'Create a upi://pay link with your UPI ID and the amount, or let DoAide Khata build it: add your UPI ID in Settings and tap Remind on any customer.'],
      ['Should I use my personal UPI ID for the shop?', 'It works, but a free merchant QR from a business payment app shows your shop name and keeps shop payments separate from personal ones.'],
      ['Is a payment screenshot proof of payment?', 'No. Screenshots can be faked. Always confirm the payment in your own UPI app, soundbox or bank statement before handing over goods or clearing udhar.'],
    ],
    cta: ['/', 'Collect udhar on UPI with a free khata'],
  },
  {
    slug: 'gst-bill-format-for-small-shops',
    title: 'GST Bill Format for Small Shops and Kirana Stores (with Free Bill Maker) | DoAide Khata',
    h1: 'GST bill format for small shops and kirana stores',
    description:
      'What a GST tax invoice must include, when a small shop can issue a bill of supply instead, CGST + SGST vs IGST, HSN codes and a free bill maker that works on your phone.',
    updated: '2026-10-22',
    intro: `<p>If your shop is registered under GST, every sale needs a proper bill. Customers who run their own business ask for one so they can claim input tax credit, and a clean bill protects you if there is ever a question from the tax department.</p>
<p>This guide explains, in plain language, what a GST bill must contain, which type of bill to issue, and how to make one in a minute from your phone. It is general information, not tax advice — your CA has the final word for your business.</p>`,
    sections: [
      [
        'which-bill',
        'Tax invoice, bill of supply or no bill?',
        `<table>
<thead><tr><th>Your situation</th><th>What to issue</th></tr></thead>
<tbody>
<tr><td>Regular GST-registered shop selling taxable goods</td><td>Tax invoice showing GST</td></tr>
<tr><td>Composition scheme dealer</td><td>Bill of supply (no GST shown, cannot charge GST)</td></tr>
<tr><td>Selling only exempt goods (e.g. loose fresh vegetables)</td><td>Bill of supply</td></tr>
<tr><td>Not registered (turnover below the limit)</td><td>A simple cash memo or estimate; you cannot charge GST</td></tr>
</tbody></table>
<p>For small retail sales to unregistered customers, the rules allow some relaxation on low-value bills when the customer does not ask for one, but many shops simply bill every sale so the day’s totals match the books.</p>`,
      ],
      [
        'fields',
        'What a GST tax invoice must include',
        `<ol>
<li>Your shop name, address and <strong>GSTIN</strong></li>
<li>A unique, consecutive <strong>invoice number</strong> for the financial year (for example 2026-27/0041)</li>
<li><strong>Date</strong> of issue</li>
<li>Customer name and address — and the customer’s GSTIN if they are registered</li>
<li><strong>HSN code</strong> of the goods (4 or 6 digits depending on your turnover)</li>
<li>Description, quantity, unit and rate of each item</li>
<li>Taxable value, the <strong>GST rate</strong>, and the tax amount split as CGST + SGST, or IGST</li>
<li>Place of supply (state) when selling to another state</li>
<li>Total amount, and your signature or digital signature</li>
</ol>`,
      ],
      [
        'cgst-igst',
        'CGST + SGST or IGST?',
        `<p>The split depends on where the goods are supplied, not on where the customer lives.</p>
<ul>
<li><strong>Same state</strong> (a customer buying at your counter): half the GST is CGST and half is SGST. On a ₹1,000 item at 18%, that is ₹90 CGST + ₹90 SGST.</li>
<li><strong>Another state</strong> (you ship goods to a buyer in a different state): the full 18% is IGST, ₹180.</li>
</ul>
<p>Getting this wrong means the customer cannot claim credit and you may have to pay the right tax again, so double-check before sending goods out of state.</p>`,
      ],
      [
        'hsn',
        'Finding the right HSN code and GST rate',
        `<p>Most kirana goods fall into a handful of HSN chapters — food grains, edible oil, packaged food, soaps and toiletries. Packaged and labelled items often carry a different rate from loose ones. Look up each product once, write the HSN and rate next to it in your product list, and reuse it. The <a href="https://gst.doaide.com">DoAide GST rate finder</a> helps you search by product name.</p>`,
      ],
      [
        'make-bill',
        'Make a GST bill on your phone in one minute',
        `<ol>
<li>Open <a href="/bill">DoAide Khata → Bill</a>. Add your shop name, address and GSTIN once in <a href="/settings">Settings</a>.</li>
<li>Pick the customer (or type a new name) and add items with HSN, quantity, rate and GST %.</li>
<li>Tick “inter-state” only if you are supplying to another state — the app switches from CGST + SGST to IGST.</li>
<li>Save. Invoice numbers run in sequence for each financial year automatically.</li>
<li>Download the PDF or send it on WhatsApp. If the customer is paying later, tick “add to khata” and the total goes straight into their udhar.</li>
</ol>
<p>Everything works without signing up, and the bills stay on your phone.</p>`,
      ],
    ],
    faqs: [
      ['Can a composition dealer charge GST on the bill?', 'No. Composition dealers issue a bill of supply and cannot collect GST from customers; they pay tax on turnover at the composition rate.'],
      ['Do invoice numbers have to restart every year?', 'Invoice numbers must be unique and consecutive within a financial year. Most shops use a prefix with the year, like 2026-27/001, and restart the counter each April.'],
      ['Is a GST bill made on a phone valid?', 'Yes. The law cares about what the invoice contains, not the software used. A PDF with all the required fields is a valid tax invoice.'],
      ['When should I use IGST instead of CGST and SGST?', 'Use IGST when the place of supply is in a different state from your shop, such as goods shipped to a buyer in another state. Counter sales in your own state use CGST + SGST.'],
    ],
    cta: ['/bill', 'Make a free GST bill now — no login'],
  },
  {
    slug: 'khata-app-without-signup',
    title: 'Udhar Khata App Without Signup or OTP: How No-Login Khata Works | DoAide Khata',
    h1: 'A khata app without signup: how a no-login udhar khata works',
    description:
      'Most khata apps want your phone number and an OTP before you write a single entry. Here is how a no-login digital khata works, where your data is stored, and how to keep it safe.',
    updated: '2026-10-22',
    intro: `<p>Popular udhar apps such as Khatabook and OkCredit ask you to install an app and verify your mobile number before you can record anything. That suits many shops. But some shopkeepers would rather not hand over their number, have an old phone with little storage, or just want to try a digital khata for a day before deciding.</p>
<p>A no-login khata runs in the phone’s browser. This guide explains how it works and what you trade off.</p>`,
    sections: [
      [
        'how',
        'How a no-login khata works',
        `<p>When you open <a href="/">DoAide Khata</a>, the app loads in your browser like any website. Customers, entries and bills are saved in the browser’s own storage on your phone — not on a server. Nothing leaves the phone unless you send a WhatsApp reminder, make a PDF, or choose to turn on sync.</p>
<p>You can add it to your home screen from the browser menu (“Add to Home screen” / “Install app”). It then opens full-screen like an installed app, and it keeps working when the internet is weak or off.</p>`,
      ],
      [
        'compare',
        'Login vs no-login: what you trade',
        `<table>
<thead><tr><th></th><th>App with phone/OTP login</th><th>No-login browser khata</th></tr></thead>
<tbody>
<tr><td>Start recording</td><td>After install + OTP</td><td>Immediately</td></tr>
<tr><td>Phone storage</td><td>App install needed</td><td>No install; optional home-screen icon</td></tr>
<tr><td>Data location</td><td>Company servers</td><td>Your phone (optional Google sync)</td></tr>
<tr><td>New phone</td><td>Log in again</td><td>Restore a backup file, or sign in to sync</td></tr>
<tr><td>Works offline</td><td>Usually</td><td>Yes, once opened</td></tr>
</tbody></table>`,
      ],
      [
        'safety',
        'Keeping a no-login khata safe',
        `<ul>
<li><strong>Download a backup every couple of weeks.</strong> Settings → Download backup saves one small file you can keep on WhatsApp “Message yourself” or Google Drive. The app reminds you when it has been a while.</li>
<li><strong>Don’t clear browser data</strong> for the site, and use your normal browser rather than a private/incognito tab.</li>
<li><strong>Turn on Google sync if you have many customers.</strong> It is optional and only stores your khata so you can open it on another phone.</li>
<li><strong>Use a screen lock</strong> on the phone, as you would for any khata.</li>
</ul>`,
      ],
      [
        'try',
        'Try it in two minutes',
        `<ol>
<li>Open <a href="/">khata.doaide.com</a> and pick Hindi or English.</li>
<li>Add one customer and tap <em>Gave ₹</em> for today’s udhar.</li>
<li>Add your UPI ID in Settings and tap <em>Remind</em> to see the WhatsApp message.</li>
</ol>
<p>Only need to send one reminder? The <a href="/tools/whatsapp-reminder">free reminder maker</a> does that without creating a khata at all.</p>`,
      ],
    ],
    faqs: [
      ['Is a khata app without login safe?', 'Your entries stay in your phone’s browser storage and are not uploaded anywhere unless you turn on sync. Keep regular backups and a screen lock, and it is as safe as the phone itself.'],
      ['What happens if I change my phone?', 'Download a backup file in Settings and restore it on the new phone, or sign in with Google before switching so your khata syncs automatically.'],
      ['Does a no-login khata work without internet?', 'Yes. After the first visit the app is cached on the phone, so you can add customers and entries offline. Reminders and PDFs need internet.'],
      ['Can two people use the same khata?', 'Sign in with the same Google account on both phones and turn on sync. Entries made on one phone appear on the other.'],
    ],
    cta: app,
  },
  {
    slug: 'free-digital-ledger-for-shopkeepers',
    title: 'Free Digital Ledger for Shopkeepers: Ditch the Paper Bahi Khata (2026) | DoAide Khata',
    h1: 'Free digital ledger for shopkeepers: ditch the paper bahi khata in 2026',
    description:
      'Why kirana and retail shop owners are replacing the paper bahi khata with a free digital ledger: customer-wise udhar tracking, WhatsApp reminders, UPI collection and backups — with a one-day switching plan.',
    updated: '2026-10-22',
    intro: `<p>Walk into any kirana store, medical shop or hardware dealer in India and you will find the same two things behind the counter: a UPI QR code and a worn paper register of <strong>udhar</strong>. The QR code modernised how customers pay; the register is still where the shop's money quietly leaks. Entries get smudged, pages tear, balances are added up wrong at 9 pm after a 14-hour day, and nobody remembers whether Gupta ji's ₹500 from Tuesday was ever written down.</p>
<p>A <strong>free digital ledger</strong> fixes all of this without changing how you work: you still record "gave" and "got", but your phone does the maths, keeps the proof and sends the reminders. This guide shows what a digital ledger actually does for a shopkeeper, what it costs (nothing, if you choose right), and how to switch from paper in a single day.</p>`,
    sections: [
      [
        'paper-problems',
        'What the paper bahi khata really costs you',
        `<p>Paper feels free, but shopkeepers who track it find the old register costs real money every month:</p>
<ul>
<li><strong>Forgotten entries.</strong> In rush hour you serve three customers at once. One udhar entry missed per day at an average ₹150 is roughly <strong>₹4,500 a month</strong> of goods given away.</li>
<li><strong>Silent balances.</strong> Money you don't actively see, you don't actively collect. Outstanding udhar quietly grows to ₹30,000–50,000 across 25–40 customers.</li>
<li><strong>Disputes.</strong> "Maine toh pichhle hafte de diye the" — with no dated, itemised proof, you either absorb the loss or lose the customer.</li>
<li><strong>One single copy.</strong> A spilled chai, a lost diary or one torn page and years of hisaab are gone.</li>
<li><strong>Your evenings.</strong> Totalling balances by hand every week is unpaid clerical work.</li>
</ul>`,
      ],
      [
        'what-digital-gives',
        'What a digital ledger gives you instead',
        `<table>
<thead><tr><th>Job</th><th>Paper register</th><th>Digital ledger</th></tr></thead>
<tbody>
<tr><td>Customer's current balance</td><td>Flip pages, add by hand</td><td>On screen instantly — "₹2,350 baaki"</td></tr>
<tr><td>Payment reminder</td><td>Awkward phone call, or wait</td><td>One-tap WhatsApp message with a UPI link</td></tr>
<tr><td>Proof of entries</td><td>Your handwriting vs their memory</td><td>Dated, itemised statement you can share as PDF</td></tr>
<tr><td>Backup</td><td>None</td><td>Backup file or sync — survives a lost phone</td></tr>
<tr><td>Month-end totals</td><td>An evening of arithmetic</td><td>Already added up, customer-wise</td></tr>
</tbody></table>
<p>The result shopkeepers notice first is faster collection: a polite WhatsApp reminder with a payment link gets settled in days, not weeks, because the customer can pay the moment they read it. See our <a href="/guides/whatsapp-payment-reminder-message">ready-made reminder templates in Hindi and English</a>.</p>`,
      ],
      [
        'what-free-means',
        'What "free" should actually mean in 2026',
        `<p>Most khata apps advertise themselves as free. Before you move your shop's data in, check what free covers:</p>
<ul>
<li><strong>Free entries, forever</strong> — not a trial that later locks your own data behind a subscription.</li>
<li><strong>No ads</strong> between you and your hisaab, and no pushy loan offers dressed up as features.</li>
<li><strong>No forced signup.</strong> You should be able to start without surrendering your mobile number and OTP. <a href="/">DoAide Khata</a> opens in the browser and works immediately; signing in (with Google) is optional and only needed for sync.</li>
<li><strong>Your data stays yours.</strong> You can download a backup file anytime from <a href="/settings">Settings</a> — no "export" paywall.</li>
<li><strong>Works on any phone.</strong> A browser-based ledger needs no 60 MB download and runs on the cheapest Android.</li>
</ul>
<p>For a deeper comparison of signup-free options, read <a href="/guides/khata-app-without-signup">khata app without signup</a>.</p>`,
      ],
      [
        'switch-in-a-day',
        'How to switch from paper to digital in one day',
        `<ol>
<li><strong>Morning (10 minutes):</strong> Open <a href="/">khata.doaide.com</a>, choose Hindi or English, and add your 10 biggest udhar customers with mobile numbers.</li>
<li><strong>Enter opening balances:</strong> For each customer, copy today's balance from the register as one "Gave" entry with the note <em>opening balance</em>.</li>
<li><strong>Add your UPI ID</strong> in <a href="/settings">Settings</a> so every reminder carries a payment link. (New to UPI collection? See <a href="/guides/upi-payments-for-kirana-shops">UPI payments for kirana shops</a>.)</li>
<li><strong>Through the day:</strong> record every new udhar and payment as it happens — two taps each.</li>
<li><strong>Evening (5 minutes):</strong> send a WhatsApp reminder to your three oldest balances. Most shopkeepers recover more in the first week than they expect.</li>
<li><strong>Keep the paper register alongside for 2–3 weeks</strong> if it gives you confidence, then retire it to the drawer.</li>
</ol>`,
      ],
    ],
    faqs: [
      ['Is a digital ledger really free for shopkeepers?', 'DoAide Khata is free for unlimited customers and entries, WhatsApp reminders, UPI payment links, GST bills and PDF statements. It runs in the browser, so there is nothing to download and no subscription.'],
      ['I am not good with phones. Is it hard to use?', 'If you can use WhatsApp, you can use a digital khata. There are only two main buttons — Gave and Got — and the app can be set to Hindi. Voice entry lets you speak the entry instead of typing.'],
      ['What happens to my data if I lose my phone?', 'Download a backup file from Settings every couple of weeks, or sign in with Google to sync automatically. Either way you can restore your full khata on a new phone in minutes — something a paper register can never do.'],
      ['Can I keep using my paper bahi khata alongside?', 'Yes. Most shopkeepers run both for two or three weeks while they build trust in the app, then stop updating the paper register once the digital ledger has proven itself.'],
      ['Do my customers need to install anything?', 'No. Reminders arrive as normal WhatsApp messages with a UPI link they can pay through GPay, PhonePe, Paytm or any UPI app.'],
    ],
    cta: app,
  },
  {
    slug: 'khata-book-alternative-2026',
    title: 'Khata Book Alternative 2026: What Shopkeepers Should Look For | DoAide Khata',
    h1: 'Looking for a khata book alternative in 2026? Here is what actually matters',
    description:
      'Choosing a khata book alternative in 2026: the features shopkeepers actually need, red flags like forced signup and ads, and why a free browser-based udhar khata is worth trying.',
    updated: '2026-10-22',
    intro: `<p>Khata apps took off because they solved a real problem: the paper register could not send reminders or add up balances. But after a few years with the popular apps, many shopkeepers find themselves searching for a <strong>khata book alternative</strong> — usually because of growing ads and promotions inside the app, pressure to take loans, heavy downloads on budget phones, or simply wanting their customer data under their own control.</p>
<p>The good news: in 2026 you have real choices. This guide lists what a khata alternative must do, the red flags to avoid, and how to move your existing udhar data across without losing anything.</p>`,
    sections: [
      [
        'why-switch',
        'Why shopkeepers look for an alternative',
        `<p>Across the common khata apps, the complaints shopkeepers raise are remarkably consistent:</p>
<ul>
<li><strong>Clutter.</strong> The core job — udhar in, payment in, balance — gets buried under loan offers, insurance banners and promotions.</li>
<li><strong>Forced account creation.</strong> You cannot even try the app without a mobile number and OTP, and your customers' names and numbers go to someone's server on day one.</li>
<li><strong>App weight.</strong> Big downloads and background services slow down the budget Android phones most shops actually run on.</li>
<li><strong>Lock-in worries.</strong> Getting your own data out as a usable file is often hard to find or incomplete.</li>
<li><strong>Features you never asked for</strong> replacing the simple bahi khata flow you did.</li>
</ul>
<p>None of this means those apps are bad — they pioneered digital khata. It means your needs (a fast, clean, private ledger) and their business model (lending and cross-selling) may have drifted apart.</p>`,
      ],
      [
        'checklist',
        'The 2026 khata alternative checklist',
        `<table>
<thead><tr><th>Must have</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Fast Gave/Got entries with running balance</td><td>This is the whole job. Anything that slows it down fails.</td></tr>
<tr><td>WhatsApp reminders with UPI link</td><td>Reminders that customers can pay from directly get settled fastest.</td></tr>
<tr><td>Works without signup</td><td>Try it with real entries before trusting it; no OTP wall.</td></tr>
<tr><td>Free with no ads or loan push</td><td>Your ledger should not be a billboard.</td></tr>
<tr><td>Hindi and English</td><td>Whoever is at the counter should manage the khata.</td></tr>
<tr><td>Backup you control + optional sync</td><td>Download your data as a file; sync across phones if you choose.</td></tr>
<tr><td>Light enough for any phone</td><td>A browser-based app needs no download at all.</td></tr>
<tr><td>PDF statements and GST bills</td><td>Settle accounts cleanly and serve business customers. See our <a href="/guides/gst-bill-format-for-small-shops">GST bill format guide</a>.</td></tr>
</tbody></table>`,
      ],
      [
        'doaide-khata',
        'How DoAide Khata fits as an alternative',
        `<p><a href="/">DoAide Khata</a> was built around exactly this checklist:</p>
<ul>
<li><strong>No signup, no download.</strong> Open <a href="/">khata.doaide.com</a> in your phone browser and start entering udhar immediately. Add it to the home screen and it behaves like an app — it even works offline after the first visit.</li>
<li><strong>Free and clean.</strong> No ads, no loan offers, no subscription. Unlimited customers and entries.</li>
<li><strong>Collection built in.</strong> One-tap WhatsApp reminders in Hindi or English with your UPI link, plus a <a href="/tools/whatsapp-reminder">free reminder maker</a> you can use even without a khata.</li>
<li><strong>Your data, your choice.</strong> Entries live on your phone by default; Google sign-in enables backup and sync across phones when you want it, and you can download a backup file from <a href="/settings">Settings</a> anytime.</li>
<li><strong>Shop extras.</strong> GST bills and PDF statements when a customer needs proper paperwork.</li>
</ul>
<p>If you are comparing options broadly, our guide to the <a href="/guides/best-free-udhar-khata-app">best free udhar khata app in 2026</a> covers the full feature-by-feature thinking.</p>`,
      ],
      [
        'migrate',
        'Moving your existing khata data across',
        `<p>Switching apps does not mean re-typing history. You only need today's truth:</p>
<ol>
<li>In your current app, note each customer's <strong>current outstanding balance</strong> (or export/screenshot the balances screen).</li>
<li>In the new ledger, add each customer and record that balance as one "Gave" entry with the note <em>opening balance</em>.</li>
<li>Add your UPI ID in Settings, send a test reminder to yourself, and check it reads well.</li>
<li>Run the old app read-only for a couple of weeks in case of disputes about older entries, then uninstall it.</li>
</ol>
<p>For the full switching plan, see <a href="/guides/free-digital-ledger-for-shopkeepers">ditching the paper bahi khata</a> — the same one-day method works when leaving another app.</p>`,
      ],
    ],
    faqs: [
      ['What is the best free khata book alternative in 2026?', 'The best alternative is the one that does fast Gave/Got entries, WhatsApp reminders with UPI links, and backups — free, without ads or forced signup. DoAide Khata meets that checklist and runs in the browser with no download.'],
      ['Can I move my data from my current khata app?', 'Yes. Note each customer’s current balance in your old app and enter it as an opening-balance entry in the new ledger. You do not need to re-type old transactions — keep the old app for reference for a few weeks.'],
      ['Is a browser-based khata as good as a downloaded app?', 'For ledger work, yes. It loads instantly on any phone, needs no storage space, works offline after the first visit, and updates itself. You can pin it to your home screen so it opens like any other app.'],
      ['Why do khata apps push loans and ads?', 'Lending and advertising are how many free apps earn revenue. That is a legitimate model, but if it gets in the way of your daily hisaab, a clean alternative without those distractions may suit your shop better.'],
      ['Does DoAide Khata charge later?', 'No. The khata — unlimited entries, reminders, UPI links, GST bills and PDF statements — is free. There is no trial period and no feature wall.'],
    ],
    cta: app,
  },
]
