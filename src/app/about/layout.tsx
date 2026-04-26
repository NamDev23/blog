import type { Metadata } from "next";
import { generateAboutMetadata } from "@/lib/metadata";

// Metadata legacy cho `/about`; proxy sẽ chuyển public traffic sang `/vi/about`.
export const metadata: Metadata = generateAboutMetadata();

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
