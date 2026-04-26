import type { Metadata } from "next";
import { generatePrivacyMetadata } from "@/lib/metadata";

// Metadata legacy cho `/privacy`; proxy sẽ chuyển public traffic sang `/vi/privacy`.
export const metadata: Metadata = generatePrivacyMetadata();

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
