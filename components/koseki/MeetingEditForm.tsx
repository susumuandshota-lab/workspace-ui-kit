"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { saveMeetingAction, type SaveMeetingState } from "@/app/koseki/edit/actions";
import { MeetingContentPanes } from "@/components/koseki/MeetingContentPanes";
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

function buildInitialSections(meeting: MeetingRecord): Record<string, string> {
  return Object.fromEntries(
    defaultContentHeadings.map((key) => [key, meeting.sections[key] ?? ""])
  );
}

export function MeetingEditForm({ meeting }: MeetingEditFormProps) {
  const [state, formAction, pending] = useActionState(
    saveMeetingAction,
    initialState
  );
  const [sections, setSections] = useState(() => buildInitialSections(meeting));
  const [materials, setMaterials] = useState(() =>
    getMaterialsContent(meeting.sections)
  );
  const [heldOn, setHeldOn] = useState(meeting.frontmatter.heldOn);
  const [theme, setTheme] = useState(meeting.frontmatter.theme);

  return (
    <form
      action={formAction}
      className="mx-auto flex h-svh min-h-0 w-full max-w-6xl flex-col gap-4 px-4 py-4"
    >
      <input type="hidden" name="slug" value={meeting.slug} />
      {defaultContentHeadings.map((key) => (
        <input key={key} type="hidden" name={`section_${key}`} value={sections[key] ?? ""} />
      ))}
      <input type="hidden" name="section_資料" value={materials} />

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
            <p className="text-xs text-muted-foreground">
              「公開」にして保存すると、4ペイン（/koseki）に表示されます。下書きのままでは表示されません。
            </p>
          </Field>
          <Field label="開催日" htmlFor="heldOn">
            <Input
              id="heldOn"
              name="heldOn"
              type="date"
              value={heldOn}
              onChange={(e) => setHeldOn(e.target.value)}
              required
            />
          </Field>
          <Field label="テーマ（短い）" htmlFor="theme">
            <Input
              id="theme"
              name="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
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

      <MeetingContentPanes
        sections={sections}
        onSectionChange={(heading, value) =>
          setSections((prev) => ({ ...prev, [heading]: value }))
        }
        materials={materials}
        onMaterialsChange={setMaterials}
        theme={theme}
        heldOn={heldOn}
      />

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

      {meeting.frontmatter.status === "draft" ? (
        <p className="text-sm text-muted-foreground">
          いまは<strong className="font-medium text-foreground">下書き</strong>です。4ペイン（/koseki）には
          <strong className="font-medium text-foreground">公開済み</strong>の回次だけが表示されます。
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "保存中…" : "保存"}
          </Button>
          <Button variant="outline" render={<Link href="/koseki/edit" />}>
            一覧へ戻る
          </Button>
          <Button variant="link" render={<Link href="/koseki" />}>
            4ペイン表示（公開済みのみ）
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          4ペインでこの回次を見るには、上で「公開」を選んでから保存してください。
        </p>
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
