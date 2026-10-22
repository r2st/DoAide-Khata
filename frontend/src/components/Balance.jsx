import { formatINR } from '../lib/format'
import { useT } from '../lib/i18n'

// Khatabook convention: money to collect in red, advance held in green.
export default function Balance({ value, size = 'sm' }) {
  const { t } = useT()
  const label = value > 0 ? t('balance.get') : value < 0 ? t('balance.give') : t('balance.settled')
  const color = value > 0 ? 'text-red-600' : value < 0 ? 'text-khata' : 'text-gray-400'
  const big = size === 'lg'
  return (
    <span className={`flex flex-col ${big ? 'items-center' : 'items-end'}`}>
      <span className={`font-bold ${color} ${big ? 'text-3xl' : 'text-base'}`}>{formatINR(Math.abs(value))}</span>
      <span className={`${big ? 'text-sm' : 'text-[11px]'} text-gray-500`}>{label}</span>
    </span>
  )
}
