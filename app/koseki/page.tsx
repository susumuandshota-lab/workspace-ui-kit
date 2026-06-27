import { KosekiWorkspace } from "@/components/koseki/KosekiWorkspace";
import { loadMeetings } from "@/lib/koseki/meetings";

type PageProps = {
  searchParams: Promise<{ slug?: string }>;
};

export default async function KosekiArchivePage({ searchParams }: PageProps) {
  const { slug } = await searchParams;
  const meetings = await loadMeetings({ status: "published" });
  const initialSlug =
    slug && meetings.some((m) => m.slug === slug) ? slug : undefined;

  return <KosekiWorkspace meetings={meetings} initialSlug={initialSlug} />;
}
