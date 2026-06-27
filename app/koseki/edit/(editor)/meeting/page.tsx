import { notFound, redirect } from "next/navigation";

import { MeetingEditForm } from "@/components/koseki/MeetingEditForm";
import { loadMeeting } from "@/lib/koseki/meetings";
import { normalizeMeetingSlugFromParam } from "@/lib/koseki/slug-url";

type PageProps = {
  searchParams: Promise<{ slug?: string }>;
};

export default async function KosekiEditMeetingQueryPage({ searchParams }: PageProps) {
  const { slug: rawSlug } = await searchParams;

  if (!rawSlug?.trim()) {
    redirect("/koseki/edit");
  }

  const slug = normalizeMeetingSlugFromParam(rawSlug);

  try {
    const meeting = await loadMeeting(slug);
    return <MeetingEditForm meeting={meeting} />;
  } catch {
    notFound();
  }
}
