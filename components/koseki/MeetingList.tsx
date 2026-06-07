import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MeetingRecord } from "@/lib/koseki/schema";

type MeetingListProps = {
  meetings: MeetingRecord[];
  basePath?: string;
  showStatus?: boolean;
  emptyMessage?: string;
};

export function MeetingList({
  meetings,
  basePath = "/koseki",
  showStatus = false,
  emptyMessage = "公開された回次はまだありません。",
}: MeetingListProps) {
  if (meetings.length === 0) {
    return (
      <p className="px-4 py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-8">
      {meetings.map((meeting) => (
        <li key={meeting.slug}>
          <Link href={`${basePath}/${meeting.slug}`}>
            <Card className="transition-colors hover:bg-muted/30">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{meeting.frontmatter.folderSlug}</CardTitle>
                  {showStatus ? (
                    <Badge
                      variant={
                        meeting.frontmatter.status === "published"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {meeting.frontmatter.status === "published"
                        ? "公開"
                        : "下書き"}
                    </Badge>
                  ) : null}
                </div>
                <CardDescription>
                  開催日 {meeting.frontmatter.heldOn} · {meeting.frontmatter.theme}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
