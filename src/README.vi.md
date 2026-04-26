# Bản đồ source code ShadowDev

File này giúp developer mới đọc nhanh cấu trúc `src`. Comment chi tiết vẫn nằm
trực tiếp trong các file code quan trọng; tài liệu này chỉ đóng vai trò bản đồ.

## Luồng request chính

1. `src/proxy.ts` ép public route về URL có locale, ví dụ `/blog` -> `/vi/blog`.
2. `src/app/layout.tsx` đọc locale từ header nội bộ và bọc `LanguageProvider`.
3. Các page public dùng component chung, còn route `/[locale]/...` chỉ sinh metadata
   đúng ngôn ngữ và tái sử dụng UI.
4. Blog/article gọi API trong `src/app/api/**`, dữ liệu chính đến từ Supabase và
   fallback mock chỉ dùng local development.

## Thư mục quan trọng

- `src/app`: App Router pages, layouts, SEO routes, API routes và admin console.
- `src/components`: Component UI public, comment UI, blog card, header/footer.
- `src/components/admin`: Rich text editor cho CMS admin.
- `src/components/ui`: Primitive nhỏ của design system như Button, Section, Input.
- `src/hooks`: Hook client-side gọi API và giữ loading/error/refetch state.
- `src/lib`: Helper lõi cho i18n, metadata, Supabase, security, sanitize, mock API.
- `src/types`: TypeScript interface dùng chung giữa API, component và hook.

## Blog song ngữ

- `posts` giữ bản canonical/default để tương thích dữ liệu cũ và các query cơ bản.
- `post_translations` lưu nội dung theo locale `vi` và `en`.
- Admin editor gửi cả hai bản qua payload `translations`.
- Admin có thể soạn hoàn chỉnh một ngôn ngữ trước, sau đó dùng endpoint AI
  `/api/admin/translate-post` để tạo bản còn lại trong editor.
- Hệ thống không dịch realtime theo từng lần gõ vì dễ tốn chi phí AI, tăng độ trễ
  và có nguy cơ ghi đè bản dịch đã được admin chỉnh tay.
- Khi publish, nếu một ngôn ngữ đã đủ dữ liệu nhưng ngôn ngữ còn lại chưa đủ, editor
  sẽ tự gọi AI để tạo bản thiếu trước khi lưu.
- Public article/card gọi `localizePost()` để ưu tiên translation từ database theo
  locale hiện tại; file `postTranslations.ts` chỉ còn là fallback cho mock/cũ.
- Khi publish, API yêu cầu đủ title, excerpt và content cho cả tiếng Việt lẫn tiếng Anh.

## SEO trong admin

- Điểm SEO trong editor là checklist local để bắt lỗi metadata thiếu, độ dài title,
  meta description, slug và độ sâu nội dung; đây không phải cam kết thứ hạng Google.
- Nút AI SEO gọi `/api/admin/seo-suggestions` để tạo `seo_title`,
  `seo_description`, slug, tag, focus keyword và ghi chú review từ bản nháp hiện tại.
- Kết quả AI chỉ điền vào form để admin kiểm tra lại trước khi lưu/publish.

## Quy tắc bảo trì

- Public write API phải đi qua `requireSafeRequestOrigin`, `rateLimit` và sanitize.
- Admin write API phải đi qua `requireAdmin` và dùng `supabaseAdmin`.
- Không trả email comment ra public; dùng `PUBLIC_COMMENT_SELECT`.
- Nội dung bài viết render bằng HTML phải sanitize trước khi lưu và trước khi preview.
- Metadata/canonical/hreflang nên thêm qua `src/lib/metadata.ts`, không hard-code
  riêng trong từng page.
- Khi thêm page public mới, cần thêm metadata song ngữ, route `/[locale]`, sitemap
  và navigation nếu page đó là cấp chính.
