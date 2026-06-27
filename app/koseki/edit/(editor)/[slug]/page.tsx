import { redirect } from "next/navigation";

import { normalizeMeetingSlugFromParam } from "@/lib/koseki/slug-url";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** 旧 URL (/koseki/edit/2026-06_テーマ) をクエリ形式へ転送 */
export default async function KosekiEditMeetingLegacyPage({ params }: PageProps) {
  const { slug } = await params;
  const decoded = normalizeMeetingSlugFromParam(slug);
  redirect(`/koseki/edit/meeting?slug=${encodeURIComponent(decoded)}`);
}
