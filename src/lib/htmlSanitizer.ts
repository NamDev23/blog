/**
 * Sanitizer HTML tối giản cho nội dung bài viết do admin nhập.
 *
 * Đây không thay thế hoàn toàn một HTML sanitizer chuyên dụng như DOMPurify trên
 * môi trường cần xử lý HTML không tin cậy từ nhiều tác giả. Trong project này,
 * input đến từ admin đã đăng nhập; lớp này chủ yếu giảm rủi ro XSS do paste nhầm
 * script/iframe/event handler vào editor trước khi render bằng `dangerouslySetInnerHTML`.
 */
export function sanitizeHtmlContent(value: unknown, maxLength = 100000) {
  if (typeof value !== 'string') return '';

  return value
    // Loại bỏ control characters để tránh payload ẩn hoặc phá layout.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, maxLength)
    // Chặn các tag có khả năng chạy script, nhúng nội dung ngoài hoặc thay đổi form/meta.
    .replace(/<\s*(script|iframe|object|embed|base|form|input|button|textarea|select|option|meta|link|svg|math|style|noscript|template)[\s\S]*?<\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|iframe|object|embed|base|form|input|button|textarea|select|option|meta|link|svg|math|style|noscript|template)[^>]*\/?>/gi, '')
    // Chặn inline event handler như `onclick=...`.
    .replace(/\son\w+=(["']).*?\1/gi, '')
    .replace(/\son\w+=\S+/gi, '')
    // Chặn URL scheme có thể thực thi script trong href/src/action.
    .replace(/\s(href|src|xlink:href|formaction|action|poster)=(["'])\s*(javascript:|vbscript:|data:)[\s\S]*?\2/gi, ' $1="#"')
    .replace(/\s(href|src|xlink:href|formaction|action|poster)=\s*(javascript:|vbscript:|data:)\S*/gi, ' $1="#"');
}
