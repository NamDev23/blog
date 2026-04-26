import type { Metadata } from 'next';
import { generateProjectsMetadata } from '@/lib/metadata';

export const metadata: Metadata = generateProjectsMetadata();

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
