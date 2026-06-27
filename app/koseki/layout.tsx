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
  // 4ペイン閲覧は KosekiWorkspace 側で h-svh を管理。編集画面は縦スクロールが必要。
  return <div className="min-h-svh bg-background">{children}</div>;
}
