export const parseCommentContent = (text) => {
  let html = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:blue; text-decoration:underline;">$1</a>');
  html = html.replace(/(?<!href=")(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:blue;">$1</a>');
  
  html = html.replace(/(\d{1,2}:)?\d{1,2}:\d{2}/g, (match) => {
    const parts = match.split(':').map(Number);
    const seconds = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
    return `<span class="timestamp" data-seconds="${seconds}" style="color:blue; cursor:pointer; text-decoration:underline;">${match}</span>`;
  });
  return { __html: html };
};