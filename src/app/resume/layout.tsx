import type { Metadata } from 'next';
import { generateResumeMetadata } from '@/lib/metadata';

export const metadata: Metadata = generateResumeMetadata();

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
