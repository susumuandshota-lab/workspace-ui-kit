import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "戸籍研究月例会",
  description: "会員向け月次アーカイブ",
};

export default function KosekiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-svh overflow-hidden bg-background">{children}</div>;
}
