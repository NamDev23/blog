export function sanitizeHtmlContent(value: unknown, maxLength = 100000) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, maxLength)
    .replace(/<\s*(script|iframe|object|embed|base|form|input|button|textarea|select|option|meta|link|svg|math|style|noscript|template)[\s\S]*?<\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|iframe|object|embed|base|form|input|button|textarea|select|option|meta|link|svg|math|style|noscript|template)[^>]*\/?>/gi, '')
    .replace(/\son\w+=(["']).*?\1/gi, '')
    .replace(/\son\w+=\S+/gi, '')
    .replace(/\s(href|src|xlink:href|formaction|action|poster)=(["'])\s*(javascript:|vbscript:|data:)[\s\S]*?\2/gi, ' $1="#"')
    .replace(/\s(href|src|xlink:href|formaction|action|poster)=\s*(javascript:|vbscript:|data:)\S*/gi, ' $1="#"');
}
