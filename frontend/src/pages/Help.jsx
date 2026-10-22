import { Link, useNavigate } from 'react-router-dom'
import BackLink from '../components/BackLink'
import Seo from '../components/Seo'
import { useT } from '../lib/i18n'
import { ONBOARDED_KEY, removeKey } from '../lib/storage'

export const FAQ = [
  {
    q: { en: 'Is DoAide Khata free?', hi: 'क्या DoAide खाता मुफ़्त है?' },
    a: {
      en: 'Yes. Recording udhar, reminders, GST bills and PDF statements are all free.',
      hi: 'हाँ। उधार लिखना, रिमाइंडर, GST बिल और PDF स्टेटमेंट — सब मुफ़्त है।',
    },
  },
  {
    q: { en: 'Do I need to sign up?', hi: 'क्या साइन अप ज़रूरी है?' },
    a: {
      en: 'No. Your khata is saved in this phone’s browser. Sign in with Google only if you want a backup and sync across devices.',
      hi: 'नहीं। आपका खाता इसी फ़ोन के ब्राउज़र में सेव रहता है। बैकअप और दूसरे फ़ोन पर सिंक के लिए ही Google से साइन इन करें।',
    },
  },
  {
    q: { en: 'How do I send a payment reminder?', hi: 'भुगतान रिमाइंडर कैसे भेजें?' },
    a: {
      en: 'Open a customer and tap “Remind”. WhatsApp opens with the due amount and your UPI payment link. Add your UPI ID in Settings first.',
      hi: 'ग्राहक खोलें और “रिमाइंडर” दबाएं। WhatsApp में बाकी रकम और आपका UPI लिंक तैयार मिलेगा। पहले सेटिंग्स में अपना UPI ID डालें।',
    },
  },
  {
    q: { en: 'What do “Gave” and “Got” mean?', hi: '“दिए” और “मिले” का क्या मतलब है?' },
    a: {
      en: '“Gave” is udhar — goods or money given on credit, so the customer owes you more. “Got” is a payment from the customer, which reduces what they owe.',
      hi: '“दिए” यानी उधार — सामान या पैसे उधार दिए, ग्राहक पर बाकी बढ़ा। “मिले” यानी ग्राहक से भुगतान मिला, बाकी कम हुआ।',
    },
  },
  {
    q: { en: 'Can I add entries by voice?', hi: 'क्या बोलकर एंट्री कर सकते हैं?' },
    a: {
      en: 'Yes. Tap the mic in Quick entry and say something like “Ramesh ko 500 udhar diya”. Check the filled form and save.',
      hi: 'हाँ। फटाफट एंट्री में माइक दबाकर बोलें, जैसे “रमेश को 500 उधार दिया”। भरा हुआ फ़ॉर्म देखकर सेव करें।',
    },
  },
  {
    q: { en: 'Can I make GST bills?', hi: 'क्या GST बिल बना सकते हैं?' },
    a: {
      en: 'Yes. The Bill page calculates CGST + SGST (or IGST for inter-state sales), creates a PDF, and can add the total to the customer’s khata.',
      hi: 'हाँ। बिल पेज CGST + SGST (या दूसरे राज्य के लिए IGST) जोड़ता है, PDF बनाता है, और कुल रकम ग्राहक के खाते में जोड़ सकता है।',
    },
  },
  {
    q: { en: 'What if I clear my browser data?', hi: 'ब्राउज़र डेटा साफ़ कर दिया तो?' },
    a: {
      en: 'Local data would be lost. Sign in with Google to keep a synced copy, or download a backup file from Settings regularly.',
      hi: 'लोकल डेटा मिट जाएगा। Google से साइन इन करके सिंक रखें, या सेटिंग्स से बैकअप फ़ाइल डाउनलोड करते रहें।',
    },
  },
]

export default function Help() {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q.en, acceptedAnswer: { '@type': 'Answer', text: f.a.en } })),
  }
  return (
    <>
      <Seo
        title="Help & FAQ — How to use the digital udhar khata | DoAide Khata"
        description="How to record udhar, send WhatsApp payment reminders with UPI, add entries by voice, make GST bills and back up your khata. हिंदी में भी।"
        path="/help"
        jsonLd={[faqLd]}
      />
      <BackLink />
      <article>
        <h1 className="mb-4 text-2xl font-bold">{t('help.title')}</h1>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q.en} className="card group">
              <summary className="flex min-h-[32px] cursor-pointer list-none items-center font-semibold">
                <span className="mr-2 inline-block text-xl text-khata transition-transform group-open:rotate-90">›</span>
                {f.q[lang]}
              </summary>
              <p className="mt-2 text-sm text-gray-700">{f.a[lang]}</p>
            </details>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              removeKey(ONBOARDED_KEY)
              navigate('/?guide=1')
            }}
          >
            🎓 {t('onb.replay')}
          </button>
          <Link to="/tools/whatsapp-reminder" className="btn-ghost">
            💬 {t('nav.reminderTool')}
          </Link>
          <Link to="/" className="btn-primary">
            {t('goHome')}
          </Link>
        </div>
      </article>
    </>
  )
}
