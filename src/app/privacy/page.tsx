'use client';

import { motion } from 'framer-motion';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import { siteConfig } from '@/lib/site';
import { useLanguage } from '@/lib/i18n';

export default function PrivacyPage() {
  const { locale } = useLanguage();
  const copy = locale === 'vi'
    ? {
        title: 'Chính sách quyền riêng tư',
        description: 'Cập nhật lần cuối: Tháng 4 năm 2026',
        sections: [
          {
            title: 'Giới thiệu',
            paragraphs: [`Chào mừng đến với ${siteConfig.name}. Chính sách này giải thích thông tin nào có thể được thu thập qua website và cách thông tin đó được xử lý.`],
          },
          {
            title: 'Thông tin chúng tôi thu thập',
            paragraphs: ['Chúng tôi có thể thu thập thông tin theo các cách sau:'],
            list: [
              'Thông tin bạn tự nguyện gửi qua form liên hệ hoặc bình luận',
              'Dữ liệu phân tích vận hành nếu biến môi trường analytics được cấu hình',
              'Email gửi cho newsletter hoặc moderation bình luận',
            ],
          },
          {
            title: 'Cách sử dụng thông tin',
            paragraphs: ['Thông tin được dùng cho các mục đích sau:'],
            list: [
              'Phản hồi yêu cầu liên hệ và duyệt bình luận',
              'Cải thiện chất lượng nội dung và độ ổn định website',
              'Bảo vệ form public, API và workflow xuất bản khỏi abuse',
            ],
          },
          {
            title: 'Cookie và tracking',
            paragraphs: ['Script analytics chỉ được tải khi các biến môi trường public tương ứng được cấu hình. Bạn có thể kiểm soát cookie và bộ nhớ trình duyệt trong phần cài đặt browser.'],
          },
          {
            title: 'Liên kết bên thứ ba',
            paragraphs: ['Website có thể chứa link tới website bên thứ ba. Chúng tôi không chịu trách nhiệm cho thực hành quyền riêng tư của các website bên ngoài. Bạn nên đọc chính sách của họ trước khi cung cấp thông tin cá nhân.'],
          },
          {
            title: 'Bảo mật dữ liệu',
            paragraphs: ['Website dùng security headers, validation form, admin-key protection cho write endpoint và giảm field bình luận public. Không website nào bảo đảm an toàn tuyệt đối, nhưng implementation được thiết kế để giảm rủi ro phổ biến.'],
          },
          {
            title: 'Quyền của bạn',
            paragraphs: ['Bạn có quyền:'],
            list: [
              'Truy cập thông tin cá nhân bạn đã gửi',
              'Yêu cầu chỉnh sửa hoặc xóa khi phù hợp',
              'Từ chối nhận thông tin marketing',
            ],
          },
          {
            title: 'Liên hệ',
            paragraphs: [`Nếu bạn có câu hỏi về chính sách này, vui lòng liên hệ qua:`, `Email: ${siteConfig.email}\nLocation: ${siteConfig.location}`],
          },
          {
            title: 'Thay đổi chính sách',
            paragraphs: ['Chúng tôi có thể cập nhật chính sách này theo thời gian. Thay đổi sẽ được đăng trên trang này và cập nhật ngày ở phần đầu.'],
          },
        ],
      }
    : {
        title: 'Privacy Policy',
        description: 'Last updated: April 2026',
        sections: [
          {
            title: 'Introduction',
            paragraphs: [`Welcome to ${siteConfig.name}. This policy explains what information may be collected through the website and how it is handled.`],
          },
          {
            title: 'Information We Collect',
            paragraphs: ['We may collect information about you in various ways, including:'],
            list: [
              'Information you voluntarily provide through contact or comment forms',
              'Operational analytics if analytics environment variables are configured',
              'Email addresses submitted for newsletters or comment moderation',
            ],
          },
          {
            title: 'How We Use Your Information',
            paragraphs: ['We use the information we collect for various purposes:'],
            list: [
              'To respond to inquiries and moderate comments',
              'To improve content quality and site reliability',
              'To protect public forms, APIs, and publishing workflows from abuse',
            ],
          },
          {
            title: 'Cookies and Tracking',
            paragraphs: ['Analytics scripts are loaded only when the corresponding public environment variables are configured. You can control cookies and similar browser storage through your browser preferences.'],
          },
          {
            title: 'Third-Party Links',
            paragraphs: ['Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.'],
          },
          {
            title: 'Data Security',
            paragraphs: ['The site uses security headers, form validation, admin-key protection for write endpoints, and reduced public comment fields. No website can guarantee absolute security, but the implementation is designed to reduce common exposure.'],
          },
          {
            title: 'Your Rights',
            paragraphs: ['You have the right to:'],
            list: [
              'Access personal information you submitted',
              'Request correction or deletion where applicable',
              'Opt out of marketing communications',
            ],
          },
          {
            title: 'Contact Us',
            paragraphs: [`If you have any questions about this Privacy Policy or our privacy practices, please contact us at:`, `Email: ${siteConfig.email}\nLocation: ${siteConfig.location}`],
          },
          {
            title: 'Changes to This Policy',
            paragraphs: ['We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date above.'],
          },
        ],
      };
  return (
    <>
      {/* Page Header */}
      {/* Page Header */}
      <PageHeader
        title={copy.title}
        description={copy.description}
      />

      {/* Content */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="prose max-w-none text-sm sm:text-base"
        >
          {copy.sections.map((section, index) => (
            <section key={section.title}>
              <h2 className={`text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 ${index === 0 ? 'mt-0' : 'mt-8'}`}>
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-[var(--text-muted)] mb-4 leading-relaxed whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
              {section.list ? (
                <ul className="text-[var(--text-muted)] mb-6 space-y-2">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </motion.div>
      </Section>
    </>
  );
}
