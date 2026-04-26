import { Metadata } from 'next';
import { generateTagsMetadata } from '@/lib/metadata';

// Metadata legacy cho `/tags`; proxy sẽ chuyển public traffic sang `/vi/tags`.
export const metadata: Metadata = generateTagsMetadata();

export default function TagsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
