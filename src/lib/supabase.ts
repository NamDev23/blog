import { createClient } from '@supabase/supabase-js';

/**
 * Khởi tạo Supabase client dùng chung.
 *
 * Có hai loại client:
 * - `supabase`: dùng anon key cho public read hoặc client-like access.
 * - `supabaseAdmin`: dùng service role key cho API admin/server write.
 *
 * Không throw ngay khi thiếu env để local development vẫn render được bằng mock
 * data; các API route sẽ gọi `ensureSupabaseConfigured()` để trả lỗi 503 rõ ràng.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const fallbackSupabaseUrl = 'https://example.supabase.co';
const fallbackSupabaseAnonKey = 'placeholder-anon-key';

export const supabaseConfigError = getSupabaseConfigError(
  supabaseUrl,
  supabaseAnonKey
);

export const isSupabaseConfigured = !supabaseConfigError;

export const supabaseAdminConfigError = getSupabaseAdminConfigError(
  supabaseUrl,
  supabaseServiceRoleKey
);

export const isSupabaseAdminConfigured = !supabaseAdminConfigError;

// Client public không lưu session vì website không dùng Supabase Auth ở trình duyệt.
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : fallbackSupabaseUrl,
  isSupabaseConfigured ? supabaseAnonKey : fallbackSupabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Client admin chỉ được import trong server/API code. Service role key có quyền
// vượt RLS, vì vậy không đưa biến này vào bất kỳ component client nào.
export const supabaseAdmin = createClient(
  isSupabaseAdminConfigured ? supabaseUrl : fallbackSupabaseUrl,
  isSupabaseAdminConfigured ? supabaseServiceRoleKey : fallbackSupabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export function getSupabaseUnavailableMessage(admin = false) {
  return admin
    ? supabaseAdminConfigError || 'Supabase admin client is not configured.'
    : supabaseConfigError || 'Supabase is not configured.';
}

export function getSupabaseErrorMessage(error: unknown) {
  // Chuẩn hóa lỗi trước khi trả ra API để admin hiểu nguyên nhân cấu hình/network.
  if (error instanceof Error) return normalizeSupabaseErrorMessage(error.message);
  if (typeof error === 'object' && error && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return normalizeSupabaseErrorMessage(message);
  }

  return 'Supabase request failed.';
}

function normalizeSupabaseErrorMessage(message: string) {
  if (message.toLowerCase().includes('fetch failed')) {
    return 'Could not connect to Supabase. Check NEXT_PUBLIC_SUPABASE_URL, Supabase keys, and network access.';
  }

  return message;
}

function getSupabaseConfigError(url: string, anonKey: string) {
  if (!isUsableSupabaseUrl(url)) {
    return 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL to your real Supabase project URL in .env.local.';
  }

  if (!isUsableSecret(anonKey, ['your-anon-key', 'placeholder-anon-key'])) {
    return 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY to your real anon key in .env.local.';
  }

  return '';
}

function getSupabaseAdminConfigError(url: string, serviceRoleKey: string) {
  if (!isUsableSupabaseUrl(url)) {
    return 'Supabase admin is not configured. Set NEXT_PUBLIC_SUPABASE_URL to your real Supabase project URL in .env.local.';
  }

  if (serviceRoleKey.startsWith('sb_publishable_')) {
    // Supabase key dạng publishable/anon không được dùng cho admin write.
    return 'Supabase admin writes need a secret/service_role key in SUPABASE_SERVICE_ROLE_KEY. Move the publishable key to NEXT_PUBLIC_SUPABASE_ANON_KEY and use an sb_secret_... or legacy service_role key here.';
  }

  if (!isUsableSecret(serviceRoleKey, ['your-service-role-key', 'placeholder-service-role-key'])) {
    return 'Supabase admin writes need SUPABASE_SERVICE_ROLE_KEY in .env.local. The anon key cannot create or edit posts with RLS enabled.';
  }

  return '';
}

function isUsableSupabaseUrl(value: string) {
  // Cho phép localhost để chạy Supabase local, nhưng production nên dùng HTTPS.
  if (!value || value.includes('your-project') || value === fallbackSupabaseUrl) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function isUsableSecret(value: string, placeholders: string[]) {
  if (!value || placeholders.includes(value)) return false;
  return value.length > 20;
}
