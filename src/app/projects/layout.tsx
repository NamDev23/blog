import type { Metadata } from 'next';
import { generateProjectsMetadata } from '@/lib/metadata';

// Metadata legacy cho `/projects`; proxy sẽ chuyển public traffic sang `/vi/projects`.
export const metadata: Metadata = generateProjectsMetadata();

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
