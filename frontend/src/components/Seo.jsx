import { Helmet } from 'react-helmet-async'

export const SITE_URL = 'https://khata.doaide.com'

export default function Seo({ title, description, path = '/', jsonLd = [] }) {
  const url = `${SITE_URL}${path}`
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="DoAide Khata" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  )
}

export const webAppLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'DoAide Khata',
  url: SITE_URL,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any (web browser)',
  inLanguage: ['en-IN', 'hi-IN'],
  description:
    'Free digital udhar khata for Indian shopkeepers: track credit, send WhatsApp payment reminders with UPI links, and make GST bills.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  publisher: { '@type': 'Organization', name: 'DoAide', url: 'https://doaide.com' },
}
