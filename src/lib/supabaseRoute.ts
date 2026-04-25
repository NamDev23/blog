import {
  getSupabaseErrorMessage,
  getSupabaseUnavailableMessage,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from '@/lib/supabase';
import { jsonResponse } from '@/lib/security';

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
  return jsonResponse(
    { error: getSupabaseErrorMessage(error) },
    { status: 503 },
    'private, no-store'
  );
}

export function isSupabaseNotFoundError(error: unknown) {
  if (typeof error !== 'object' || !error) return false;

  const code = 'code' in error ? (error as { code?: unknown }).code : undefined;
  return code === 'PGRST116';
}
