"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveMeetingAction, type SaveMeetingState } from "@/app/koseki/edit/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  defaultContentHeadings,
  getMaterialsContent,
  type MeetingRecord,
} from "@/lib/koseki/schema";

const initialState: SaveMeetingState = { ok: false, message: "" };

type MeetingEditFormProps = {
  meeting: MeetingRecord;
};

export function MeetingEditForm({ meeting }: MeetingEditFormProps) {
  const [state, formAction, pending] = useActionState(
    saveMeetingAction,
    initialState
  );
  const materials = getMaterialsContent(meeting.sections);

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <input type="hidden" name="slug" value={meeting.slug} />

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>frontmatter とファイル名（slug）を編集します</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="ファイル名（slug）" htmlFor="slug-display">
            <Input id="slug-display" value={meeting.slug} disabled />
          </Field>
          <Field label="公開状態" htmlFor="status">
            <select
              id="status"
              name="status"
              defaultValue={meeting.frontmatter.status}
              className={cn(
                "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              )}
            >
              <option value="draft">下書き（編集者のみ）</option>
              <option value="published">公開（会員一覧）</option>
            </select>
          </Field>
          <Field label="開催日" htmlFor="heldOn">
            <Input
              id="heldOn"
              name="heldOn"
              type="date"
              defaultValue={meeting.frontmatter.heldOn}
              required
            />
          </Field>
          <Field label="テーマ（短い）" htmlFor="theme">
            <Input
              id="theme"
              name="theme"
              defaultValue={meeting.frontmatter.theme}
              required
            />
          </Field>
          <Field label="フォルダ名（folderSlug）" htmlFor="folderSlug">
            <Input
              id="folderSlug"
              name="folderSlug"
              defaultValue={meeting.frontmatter.folderSlug}
              required
            />
          </Field>
        </CardContent>
      </Card>

      {defaultContentHeadings.map((key) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle>{key}</CardTitle>
            <CardDescription>Pane 2/3（見出し・内容）</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name={`section_${key}`}
              defaultValue={meeting.sections[key] ?? ""}
              rows={6}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>資料</CardTitle>
          <CardDescription>Pane 4。[表示名](URL) 形式</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="section_資料"
            defaultValue={materials}
            rows={6}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>

      {state.message ? (
        <p
          role="status"
          className={
            state.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "保存"}
        </Button>
        <Button variant="outline" render={<Link href="/koseki/edit" />}>
          一覧へ戻る
        </Button>
        <Button variant="link" render={<Link href="/koseki" />}>
          4ペイン表示
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
