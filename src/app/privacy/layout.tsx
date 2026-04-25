import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ShadowDev",
  description: "Read the ShadowDev privacy policy and how your data is handled on this site.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
