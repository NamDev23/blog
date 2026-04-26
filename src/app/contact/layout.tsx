import type { Metadata } from "next";
import { generateContactMetadata } from "@/lib/metadata";

// Metadata legacy cho `/contact`; proxy sẽ chuyển public traffic sang `/vi/contact`.
export const metadata: Metadata = generateContactMetadata();

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
