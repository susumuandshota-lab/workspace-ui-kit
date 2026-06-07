import { notFound } from "next/navigation";

import { MeetingEditForm } from "@/components/koseki/MeetingEditForm";
import { loadMeeting } from "@/lib/koseki/meetings";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function KosekiEditMeetingPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const meeting = await loadMeeting(slug);
    return <MeetingEditForm meeting={meeting} />;
  } catch {
    notFound();
  }
}
