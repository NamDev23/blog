import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { canUseMockApiFallback, getMockPosts } from '@/lib/mockApi';
import { absoluteUrl, siteConfig } from '@/lib/site';
import { localizedUrl } from '@/lib/metadata';
import type { Post } from '@/types';

/**
 * GET /rss.xml
 * Sinh RSS feed cho bài viết public.
 *
 * Feed ưu tiên bản tiếng Việt vì đó là nguồn gốc nội dung trong database/mock.
 * Metadata song ngữ vẫn được xử lý ở page SEO; RSS giữ một ngôn ngữ để reader
 * không nhận hai item trùng slug.
 */
export async function GET() {
  try {
    let posts: Post[] = [];

    if (!isSupabaseConfigured) {
      posts = canUseMockApiFallback() ? getMockPosts({ limit: 50 }) : [];
    } else {
      // Chỉ lấy bài đã publish và giới hạn 50 item mới nhất để feed nhẹ.
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching posts for RSS:', error);
        throw error;
      }

      posts = data || [];
    }

    // XML được escape thủ công vì RSS là chuỗi raw, không qua React escaping.
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>vi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl('/rss.xml')}" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${localizedUrl(`/blog/${post.slug}`, 'vi')}</link>
      <guid isPermaLink="true">${localizedUrl(`/blog/${post.slug}`, 'vi')}</guid>
      <description>${escapeXml(post.excerpt || '')}</description>
      <content:encoded><![CDATA[${stripUnsafeHtml(post.content || '')}]]></content:encoded>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      <author>${escapeXml(siteConfig.author)}</author>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ''}
      ${(post.tags || []).map((tag: string) => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
      ${post.featured_image ? `<enclosure url="${escapeXml(post.featured_image)}" type="image/jpeg"/>` : ''}
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}

/**
 * Escape ký tự đặc biệt để title/description không phá XML.
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripUnsafeHtml(value: string): string {
  // RSS content vẫn cho HTML cơ bản, nhưng loại script/iframe/event handler.
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+=(["']).*?\1/gi, '')
    .replace(/\s(href|src)=(["'])javascript:[\s\S]*?\2/gi, ' $1="#"');
}
