/** Format like 5.5.2026 05:13PM EST (Eastern Time). */
export function formatNewsTimestamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  const day = get('day')
  const month = get('month')
  const year = get('year')
  const hour = get('hour')
  const minute = get('minute')
  const dayPeriod = get('dayPeriod').toUpperCase()
  const tz = get('timeZoneName')

  return `${day}.${month}.${year} ${hour}:${minute}${dayPeriod} ${tz}`
}
