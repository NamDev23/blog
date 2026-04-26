import {
  getSupabaseErrorMessage,
  getSupabaseUnavailableMessage,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from '@/lib/supabase';
import { jsonResponse } from '@/lib/security';

/**
 * Helper chung cho các API route phụ thuộc Supabase.
 *
 * Mục tiêu là trả lỗi cấu hình thống nhất, không để mỗi route tự viết thông báo
 * khác nhau. Với admin route phải kiểm tra service role; với public route chỉ cần
 * anon key đọc dữ liệu.
 */
export function ensureSupabaseConfigured(admin = false) {
  const configured = admin ? isSupabaseAdminConfigured : isSupabaseConfigured;

  if (configured) return null;

  return jsonResponse(
    { error: getSupabaseUnavailableMessage(admin) },
    { status: 503 },
    'private, no-store'
  );
}

export function supabaseFailureResponse(error: unknown) {
  // Dùng 503 cho lỗi hạ tầng/db để client hiểu đây không phải lỗi validation.
  return jsonResponse(
    { error: getSupabaseErrorMessage(error) },
    { status: 503 },
    'private, no-store'
  );
}

export function isSupabaseNotFoundError(error: unknown) {
  // PGRST116 là mã PostgREST khi `.single()` không tìm được row.
  if (typeof error !== 'object' || !error) return false;

  const code = 'code' in error ? (error as { code?: unknown }).code : undefined;
  return code === 'PGRST116';
}
