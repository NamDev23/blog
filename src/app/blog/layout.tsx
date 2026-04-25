import type { Metadata } from "next";
import { generateBlogMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBlogMetadata();

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

