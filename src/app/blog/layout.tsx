import type { Metadata } from "next";
import { generateBlogMetadata } from "@/lib/metadata";

// Metadata legacy cho `/blog`; proxy sẽ chuyển public traffic sang `/vi/blog`.
export const metadata: Metadata = generateBlogMetadata();

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
