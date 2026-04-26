import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { defaultAuthorId, mockPosts } from '../src/lib/mockData';

loadEnvFile(resolve(process.cwd(), '.env.local'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main() {
  validatePosts();
  const resetViewCounts = process.env.RESET_VIEW_COUNTS === 'true';

  const { error: authorError } = await supabase.from('users').upsert(
    {
      id: defaultAuthorId,
      email: 'nam@example.com',
      name: 'Nam Dev',
      bio: 'IT knowledge sharing, full-stack engineering, DevOps, Docker, networking, architecture, Git, and secure web systems.',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nam',
    },
    { onConflict: 'id' }
  );

  if (authorError) throw authorError;

  let postsToSync = mockPosts;

  if (!resetViewCounts) {
    const { data: existingPosts, error: existingPostsError } = await supabase
      .from('posts')
      .select('id, view_count')
      .in('id', mockPosts.map((post) => post.id));

    if (existingPostsError) throw existingPostsError;

    const existingViewCounts = new Map(
      (existingPosts || []).map((post) => [post.id, Number(post.view_count || 0)])
    );

    postsToSync = mockPosts.map((post) => {
      if (!existingViewCounts.has(post.id)) return post;
      return {
        ...post,
        view_count: existingViewCounts.get(post.id) || 0,
      };
    });
  }

  const { error: upsertError } = await supabase
    .from('posts')
    .upsert(postsToSync, { onConflict: 'id' });

  if (upsertError) throw upsertError;

  const keepIds = mockPosts.map((post) => post.id).join(',');
  const { error: deleteError } = await supabase
    .from('posts')
    .delete()
    .not('id', 'in', `(${keepIds})`);

  if (deleteError) throw deleteError;

  console.log(`Synced ${mockPosts.length} IT posts to Supabase.`);
  console.log(resetViewCounts ? 'View counts were reset from seed data.' : 'Existing view counts were preserved.');
  mockPosts.forEach((post) => console.log(`- ${post.slug}`));
}

function validatePosts() {
  const slugs = new Set<string>();

  mockPosts.forEach((post) => {
    if (!/^[a-z0-9-]+$/.test(post.slug)) {
      throw new Error(`Invalid slug format: ${post.slug}`);
    }

    if (slugs.has(post.slug)) {
      throw new Error(`Duplicate slug: ${post.slug}`);
    }

    slugs.add(post.slug);

    if (post.seo_title && post.seo_title.length > 70) {
      throw new Error(`seo_title is too long for ${post.slug}: ${post.seo_title.length}`);
    }

    if (post.seo_description && post.seo_description.length > 170) {
      throw new Error(`seo_description is too long for ${post.slug}: ${post.seo_description.length}`);
    }
  });
}

function loadEnvFile(path: string) {
  try {
    const file = readFileSync(path, 'utf8');

    file.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) return;

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^["']|["']$/g, '');

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
  } catch {
    // The explicit env validation above reports the actionable error.
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
