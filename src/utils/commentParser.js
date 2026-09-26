const parseTimestamp = (timestamp) => {
  const parts = timestamp.split(':').map(Number)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

export const parseCommentContent = (text) => {
  if (!text) return []

  const tokens = []
  const tokenRegex =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)|(\b(?:\d{1,2}:)?\d{1,2}:\d{2}\b)/g

  let lastIndex = 0
  let match

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }

    if (match[1] && match[2]) {
      tokens.push({ type: 'link', value: match[1], href: match[2] })
    } else if (match[3]) {
      tokens.push({ type: 'link', value: match[3], href: match[3] })
    } else if (match[4]) {
      tokens.push({
        type: 'timestamp',
        value: match[4],
        seconds: parseTimestamp(match[4]),
      })
    }

    lastIndex = tokenRegex.lastIndex
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return tokens
}
