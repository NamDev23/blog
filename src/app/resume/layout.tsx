import type { Metadata } from 'next';
import { generateResumeMetadata } from '@/lib/metadata';

// Metadata legacy cho `/resume`; proxy sẽ chuyển public traffic sang `/vi/resume`.
export const metadata: Metadata = generateResumeMetadata();

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
