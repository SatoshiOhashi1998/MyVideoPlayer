export const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0)
  const h = Math.floor(safeSeconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((safeSeconds % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(safeSeconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

export const parseTimeToSeconds = (timeString) => {
  if (typeof timeString !== 'string') return 0
  const parts = timeString.split(':')
  if (parts.length !== 3) return 0
  const [h, m, s] = parts.map((part) => Number.parseInt(part, 10) || 0)
  return Math.max(h * 3600 + m * 60 + s, 0)
}
