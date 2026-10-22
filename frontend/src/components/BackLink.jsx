import { Link } from 'react-router-dom'
import { useT } from '../lib/i18n'

export default function BackLink({ to = '/' }) {
  const { t } = useT()
  return (
    <Link to={to} className="no-print mb-3 inline-flex items-center gap-1 text-sm font-medium text-khata">
      ← {t('back')}
    </Link>
  )
}
