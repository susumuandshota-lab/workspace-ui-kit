"use client";

import { useMemo, useState } from "react";

import { KosekiHeader } from "@/components/koseki/KosekiHeader";
import { MonthMeetingCard } from "@/components/koseki/MonthMeetingCard";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { parseBulletLines, parseMaterialLinks } from "@/lib/koseki/markdown";
import {
  getContentHeadings,
  getMaterialsContent,
  type MeetingRecord,
} from "@/lib/koseki/schema";

type KosekiWorkspaceProps = {
  meetings: MeetingRecord[];
};

export function KosekiWorkspace({ meetings }: KosekiWorkspaceProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    meetings[0]?.slug ?? null
  );
  const [selectedHeading, setSelectedHeading] = useState<string | null>(null);

  const selectedMeeting = useMemo(
    () => meetings.find((m) => m.slug === selectedSlug) ?? null,
    [meetings, selectedSlug]
  );

  const contentHeadings = useMemo(
    () => (selectedMeeting ? getContentHeadings(selectedMeeting.sections) : []),
    [selectedMeeting]
  );

  const activeHeading = useMemo(() => {
    if (contentHeadings.length === 0) return null;
    if (selectedHeading && contentHeadings.includes(selectedHeading)) {
      return selectedHeading;
    }
    return contentHeadings[0];
  }, [contentHeadings, selectedHeading]);

  const detailContent =
    selectedMeeting && activeHeading
      ? (selectedMeeting.sections[activeHeading] ?? "")
      : "";

  const materialsContent = selectedMeeting
    ? getMaterialsContent(selectedMeeting.sections)
    : "";
  const materialLinks = parseMaterialLinks(materialsContent);

  const selectMonth = (slug: string) => {
    setSelectedSlug(slug);
    setSelectedHeading(null);
  };

  return (
    <div className="flex h-svh min-h-0 flex-col overflow-hidden">
      <KosekiHeader />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <MonthPane
          meetings={meetings}
          selectedSlug={selectedSlug}
          onSelect={selectMonth}
        />
        <HeadingPane
          meeting={selectedMeeting}
          headings={contentHeadings}
          selectedHeading={activeHeading}
          onSelect={setSelectedHeading}
        />
        <DetailPane
          meeting={selectedMeeting}
          heading={activeHeading}
          content={detailContent}
        />
        <MaterialsPane links={materialLinks} rawContent={materialsContent} />
      </div>
    </div>
  );
}

function MonthPane({
  meetings,
  selectedSlug,
  onSelect,
}: {
  meetings: MeetingRecord[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <section className="flex w-[160px] shrink-0 flex-col border-r border-border bg-muted/40">
      <div className="border-b border-border px-3 py-3">
        <h2 className="font-heading text-sm">開催時期</h2>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="flex flex-col gap-3 p-3">
          {meetings.length === 0 ? (
            <li className="px-2 py-4 text-sm text-muted-foreground">
              公開された回次がありません
            </li>
          ) : (
            meetings.map((m) => (
              <li key={m.slug}>
                <MonthMeetingCard
                  meeting={m}
                  selected={selectedSlug === m.slug}
                  onSelect={() => onSelect(m.slug)}
                />
              </li>
            ))
          )}
        </ul>
      </ScrollArea>
    </section>
  );
}

function HeadingPane({
  meeting,
  headings,
  selectedHeading,
  onSelect,
}: {
  meeting: MeetingRecord | null;
  headings: string[];
  selectedHeading: string | null;
  onSelect: (heading: string) => void;
}) {
  return (
    <section className="flex w-[160px] shrink-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border px-3 py-3">
        <h2 className="font-heading text-sm">次第</h2>
        {meeting ? (
          <p className="text-xs text-muted-foreground">{meeting.frontmatter.theme}</p>
        ) : null}
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="flex flex-col gap-0.5 p-2">
          {!meeting ? (
            <li className="px-2 py-4 text-sm text-muted-foreground">月を選択</li>
          ) : headings.length === 0 ? (
            <li className="px-2 py-4 text-sm text-muted-foreground">次第なし</li>
          ) : (
            headings.map((h) => (
              <li key={h}>
                <button
                  type="button"
                  onClick={() => onSelect(h)}
                  className={cn(
                    "w-full rounded-lg px-2 py-2 text-left text-sm transition-colors",
                    selectedHeading === h
                      ? "bg-muted text-foreground"
                      : "hover:bg-muted/60"
                  )}
                >
                  {h}
                </button>
              </li>
            ))
          )}
        </ul>
      </ScrollArea>
    </section>
  );
}

function DetailPane({
  meeting,
  heading,
  content,
}: {
  meeting: MeetingRecord | null;
  heading: string | null;
  content: string;
}) {
  const bullets = parseBulletLines(content);
  const paragraphs = content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !p.startsWith("- "));

  return (
    <section className="min-w-0 flex-1 bg-canvas">
      <div className="border-b border-border px-6 py-3">
        <h2 className="font-heading text-sm">内容</h2>
        {meeting && heading ? (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{heading}</span>
            <Badge variant="secondary">{meeting.frontmatter.heldOn}</Badge>
          </div>
        ) : null}
      </div>
      <ScrollArea className="h-[calc(100%-3.5rem)]">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-6">
          {!meeting || !heading ? (
            <p className="text-sm text-muted-foreground">次第を選択してください</p>
          ) : bullets.length > 0 ? (
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm">
              {bullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : paragraphs.length > 0 ? (
            paragraphs.map((p) => (
              <p key={p} className="text-sm leading-relaxed">
                {p}
              </p>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">（内容なし）</p>
          )}
        </div>
      </ScrollArea>
    </section>
  );
}

function MaterialsPane({
  links,
  rawContent,
}: {
  links: { label: string; href: string }[];
  rawContent: string;
}) {
  const bullets = parseBulletLines(rawContent).filter(
    (line) => !line.match(/^\[.+\]\(.+\)$/)
  );

  return (
    <section className="flex w-[280px] shrink-0 flex-col border-l border-border bg-card">
      <div className="border-b border-border px-3 py-3">
        <h2 className="font-heading text-sm">資料</h2>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-4">
          {!rawContent.trim() ? (
            <p className="text-sm text-muted-foreground">資料リンクなし</p>
          ) : links.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {bullets.length > 0 ? (
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
              {bullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </ScrollArea>
    </section>
  );
}
