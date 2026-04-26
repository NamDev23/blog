import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, locale = 'en-US'): string {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return d.toLocaleDateString(locale, options);
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Tính reading time dựa trên content
 * @param content - HTML content hoặc plain text
 * @param wordsPerMinute - Số từ đọc được mỗi phút (mặc định: 200)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): number {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');

  // Count words (split by whitespace)
  const words = plainText.trim().split(/\s+/).length;

  // Calculate reading time in minutes
  const minutes = Math.ceil(words / wordsPerMinute);

  return minutes;
}

/**
 * Format reading time thành string
 * @param minutes - Số phút
 * @returns Formatted string (e.g., "5 min read")
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return 'Less than 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}
