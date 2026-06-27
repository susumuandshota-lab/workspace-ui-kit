import { KosekiWorkspace } from "@/components/koseki/KosekiWorkspace";
import { loadMeeting, loadMeetings } from "@/lib/koseki/meetings";
import { kosekiEditMeetingHref } from "@/lib/koseki/slug-url";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function KosekiMeetingPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const meeting = await loadMeeting(slug);

    if (meeting.frontmatter.status !== "published") {
      redirect(kosekiEditMeetingHref(slug));
    }

    const meetings = await loadMeetings({ status: "published" });
    if (!meetings.some((m) => m.slug === slug)) {
      notFound();
    }

    return <KosekiWorkspace meetings={meetings} initialSlug={slug} />;
  } catch {
    notFound();
  }
}
