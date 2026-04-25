import { Metadata } from 'next';
import { generateTagsMetadata } from '@/lib/metadata';

export const metadata: Metadata = generateTagsMetadata();

export default function TagsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

