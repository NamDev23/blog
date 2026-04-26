import type { Metadata } from "next";
import { generatePrivacyMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePrivacyMetadata();

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
