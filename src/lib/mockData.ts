import { Post } from '@/types';

const authorId = '00000000-0000-0000-0000-000000000001';

/**
 * Development fallback content used when Supabase is not reachable locally.
 */
export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Designing a Technical Portfolio for Laravel and Education Products',
    slug: 'technical-portfolio-laravel-education',
    content: `
      <h2>The goal</h2>
      <p>A strong interview website should prove the skills it claims. For this profile, the important signals are Laravel backend work, LMS/CMS/CRM experience, education chatbot thinking, and modern frontend UI.</p>

      <h2>Portfolio structure</h2>
      <p>ShadowDev now separates resume, project map, blog content, and admin publishing. This makes the site easier to explain in interviews and easier for recruiters to scan.</p>

      <h2>Why it works</h2>
      <p>The visitor can inspect real routes, protected APIs, content modeling, responsive design, and the CMS workflow instead of only reading a static CV.</p>
    `,
    excerpt: 'How ShadowDev turns Laravel, LMS, CMS, CRM, chatbot, Vue, and Next.js skills into a live interview portfolio.',
    featured_image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=700&fit=crop',
    seo_title: 'Laravel Education Portfolio',
    seo_description: 'A live interview portfolio for Laravel, LMS, CMS, CRM, chatbot, Vue, and Next.js skills.',
    canonical_url: null,
    noindex: false,
    author_id: authorId,
    category: 'Portfolio',
    tags: ['portfolio', 'laravel', 'education'],
    published_at: new Date('2026-04-20').toISOString(),
    created_at: new Date('2026-04-20').toISOString(),
    updated_at: new Date('2026-04-20').toISOString(),
    view_count: 1240,
  },
  {
    id: '2',
    title: 'Laravel Patterns for LMS and CMS Backends',
    slug: 'laravel-patterns-lms-cms-backends',
    content: `
      <h2>Backend responsibilities</h2>
      <p>Education platforms need clear data models for users, courses, lessons, enrollments, progress, permissions, and content publishing states.</p>

      <h2>Laravel fit</h2>
      <p>Laravel is strong for product modules that need routing, validation, queues, policies, Eloquent relationships, admin workflows, and maintainable business rules.</p>

      <h2>Interview signal</h2>
      <p>Use examples from LMS and CMS work to explain how backend decisions affect frontend screens, admin productivity, and long-term maintainability.</p>
    `,
    excerpt: 'Backend thinking for LMS and CMS products using Laravel, APIs, roles, validation, and database relationships.',
    featured_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=700&fit=crop',
    seo_title: 'Laravel LMS CMS Backend Patterns',
    seo_description: 'Backend thinking for LMS and CMS products using Laravel, APIs, roles, validation, and database relationships.',
    canonical_url: null,
    noindex: false,
    author_id: authorId,
    category: 'Laravel',
    tags: ['php', 'laravel', 'lms'],
    published_at: new Date('2026-04-18').toISOString(),
    created_at: new Date('2026-04-18').toISOString(),
    updated_at: new Date('2026-04-18').toISOString(),
    view_count: 980,
  },
  {
    id: '3',
    title: 'Building Admin UX for CMS and CRM Workflows',
    slug: 'admin-ux-cms-crm-workflows',
    content: `
      <h2>Admin products are work tools</h2>
      <p>CMS and CRM screens should prioritize scanning, filtering, editing, and repeated decisions. They need clarity more than decoration.</p>

      <h2>Useful interface patterns</h2>
      <p>Tables, status chips, filters, segmented controls, inline validation, empty states, and clear permissions make admin workflows faster and less error-prone.</p>

      <h2>Product value</h2>
      <p>A good admin interface saves time for staff and reduces support issues for the business.</p>
    `,
    excerpt: 'How to design CMS and CRM admin screens for repeated work, filtering, editing, and operational clarity.',
    featured_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=700&fit=crop',
    seo_title: 'CMS CRM Admin UX',
    seo_description: 'Design CMS and CRM admin screens for repeated work, filtering, editing, and operational clarity.',
    canonical_url: null,
    noindex: false,
    author_id: authorId,
    category: 'CMS',
    tags: ['cms', 'crm', 'admin'],
    published_at: new Date('2026-04-16').toISOString(),
    created_at: new Date('2026-04-16').toISOString(),
    updated_at: new Date('2026-04-16').toISOString(),
    view_count: 870,
  },
  {
    id: '4',
    title: 'Education Chatbot Flows That Support Learners',
    slug: 'education-chatbot-flows',
    content: `
      <h2>Start with learner intent</h2>
      <p>Education chatbots should answer common course questions, guide learners to the right content, capture leads, and hand off complex cases clearly.</p>

      <h2>Conversation design</h2>
      <p>Strong flows use short prompts, clear options, fallback handling, context from the course or CRM, and a path back to human support.</p>

      <h2>Where it fits</h2>
      <p>Chatbots are most useful when connected to LMS, CMS, and CRM data instead of being isolated FAQ widgets.</p>
    `,
    excerpt: 'Designing chatbot flows for education products: learner support, FAQ automation, lead capture, and handoff.',
    featured_image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=700&fit=crop',
    seo_title: 'Education Chatbot Flows',
    seo_description: 'Designing chatbot flows for education products: learner support, FAQ automation, lead capture, and handoff.',
    canonical_url: null,
    noindex: false,
    author_id: authorId,
    category: 'Chatbot',
    tags: ['chatbot', 'education', 'automation'],
    published_at: new Date('2026-04-14').toISOString(),
    created_at: new Date('2026-04-14').toISOString(),
    updated_at: new Date('2026-04-14').toISOString(),
    view_count: 760,
  },
  {
    id: '5',
    title: 'Vue.js and Next.js Interface Choices for Product Dashboards',
    slug: 'vue-next-interface-product-dashboards',
    content: `
      <h2>Choose by product need</h2>
      <p>Vue.js is effective for admin dashboards and internal tools, while Next.js is strong for content-heavy sites, SEO, and product surfaces that need server rendering.</p>

      <h2>UI discipline</h2>
      <p>Dashboards need stable layout, readable hierarchy, predictable controls, and responsive behavior. Visual polish matters, but clarity matters more.</p>

      <h2>Full-stack advantage</h2>
      <p>Knowing the backend makes frontend decisions more practical because the UI can reflect real data states and system constraints.</p>
    `,
    excerpt: 'How to position Vue.js and Next.js frontend work for dashboards, CMS products, and technical portfolios.',
    featured_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=700&fit=crop',
    seo_title: 'Vue Next Dashboard UI',
    seo_description: 'Position Vue.js and Next.js frontend work for dashboards, CMS products, and technical portfolios.',
    canonical_url: null,
    noindex: false,
    author_id: authorId,
    category: 'Frontend',
    tags: ['vue', 'nextjs', 'ui'],
    published_at: new Date('2026-04-12').toISOString(),
    created_at: new Date('2026-04-12').toISOString(),
    updated_at: new Date('2026-04-12').toISOString(),
    view_count: 690,
  },
  {
    id: '6',
    title: 'Securing a Lightweight Blog CMS',
    slug: 'securing-lightweight-blog-cms',
    content: `
      <h2>Public reads, private writes</h2>
      <p>A CMS should separate public content delivery from private admin mutations. Drafts should stay hidden, and write routes should require server-side authorization.</p>

      <h2>Session model</h2>
      <p>ShadowDev uses an admin login that exchanges a secret for an HttpOnly session cookie. API writes still verify access before touching the database.</p>

      <h2>Payload handling</h2>
      <p>Post creation normalizes slugs, validates author IDs, sanitizes content, and controls publish state.</p>
    `,
    excerpt: 'A practical security model for a lightweight CMS: HttpOnly admin sessions, protected writes, and sanitized payloads.',
    featured_image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=700&fit=crop',
    seo_title: 'Secure Lightweight Blog CMS',
    seo_description: 'A practical CMS security model with HttpOnly admin sessions, protected writes, and sanitized payloads.',
    canonical_url: null,
    noindex: false,
    author_id: authorId,
    category: 'Security',
    tags: ['cms', 'security', 'nextjs'],
    published_at: new Date('2026-04-10').toISOString(),
    created_at: new Date('2026-04-10').toISOString(),
    updated_at: new Date('2026-04-10').toISOString(),
    view_count: 640,
  },
];
