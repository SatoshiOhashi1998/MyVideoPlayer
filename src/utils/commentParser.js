// src/utils/commentParser.js

/**
 * コメント本文を解析する。
 *
 * 戻り値:
 * [
 *   { type: 'text', value: 'こんにちは ' },
 *   { type: 'timestamp', value: '12:34', seconds: 754 },
 *   { type: 'text', value: ' ' },
 *   { type: 'link', value: 'https://example.com', href: 'https://example.com' }
 * ]
 *
 * HTMLは一切生成しない。
 */
export const parseCommentContent = (text) => {
  if (!text) return [];

  const tokens = [];

  /*
   * 以下をまとめて検出する。
   *
   * 1. Markdownリンク
   *    [タイトル](https://example.com)
   *
   * 2. 通常URL
   *    https://example.com
   *
   * 3. タイムスタンプ
   *    12:34
   *    1:12:34
   */
  const tokenRegex =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)|(\b(?:\d{1,2}:)?\d{1,2}:\d{2}\b)/g;

  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    // トークンの前にある通常テキスト
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        value: text.slice(lastIndex, match.index)
      });
    }

    // Markdownリンク
    if (match[1] && match[2]) {
      tokens.push({
        type: 'link',
        value: match[1],
        href: match[2]
      });
    }

    // 通常URL
    else if (match[3]) {
      tokens.push({
        type: 'link',
        value: match[3],
        href: match[3]
      });
    }

    // タイムスタンプ
    else if (match[4]) {
      const timestamp = match[4];

      tokens.push({
        type: 'timestamp',
        value: timestamp,
        seconds: parseTimestamp(timestamp)
      });
    }

    lastIndex = tokenRegex.lastIndex;
  }

  // 最後のトークン以降のテキスト
  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      value: text.slice(lastIndex)
    });
  }

  return tokens;
};


/**
 * "MM:SS" または "HH:MM:SS" を秒数に変換する。
 */
const parseTimestamp = (timestamp) => {
  const parts = timestamp.split(':').map(Number);

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
};