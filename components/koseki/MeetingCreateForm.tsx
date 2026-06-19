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
import { defaultContentHeadings } from "@/lib/koseki/schema";

const initialState: SaveMeetingState = { ok: false, message: "" };

const defaultSections = Object.fromEntries(
  defaultContentHeadings.map((key) => [
    key,
    key === "研修" || key === "その他" ? "なし" : "",
  ])
) as Record<string, string>;

export function MeetingCreateForm() {
  const [state, formAction, pending] = useActionState(
    saveMeetingAction,
    initialState
  );

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <input type="hidden" name="isCreate" value="1" />

      <Card>
        <CardHeader>
          <CardTitle>新規月次を作成</CardTitle>
          <CardDescription>
            slug は YYYY-MM_テーマ 形式。Neon データベースに保存されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="slug（ファイル名）" htmlFor="slug">
            <Input
              id="slug"
              name="slug"
              placeholder="2026-06_除籍の読み方"
              pattern="[0-9]{4}-[0-9]{2}_[^\\s/\\\\]+"
              required
            />
          </Field>
          <Field label="公開状態" htmlFor="status">
            <select
              id="status"
              name="status"
              defaultValue="draft"
              className={cn(
                "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              )}
            >
              <option value="draft">下書き（編集者のみ）</option>
              <option value="published">公開（会員一覧）</option>
            </select>
          </Field>
          <Field label="開催日" htmlFor="heldOn">
            <Input id="heldOn" name="heldOn" type="date" required />
          </Field>
          <Field label="テーマ（短い）" htmlFor="theme">
            <Input id="theme" name="theme" placeholder="除籍の読み方" required />
          </Field>
          <Field label="フォルダ名（folderSlug）" htmlFor="folderSlug">
            <Input
              id="folderSlug"
              name="folderSlug"
              placeholder="2026-06_除籍の読み方"
              required
            />
          </Field>
        </CardContent>
      </Card>

      {defaultContentHeadings.map((key) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle>{key}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name={`section_${key}`}
              defaultValue={defaultSections[key]}
              rows={key === "事務連絡" ? 4 : 3}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>資料</CardTitle>
          <CardDescription>[表示名](URL) 形式</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="section_資料"
            placeholder="- [資料名](https://drive.google.com/...)"
            rows={4}
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
          {pending ? "作成中…" : "作成"}
        </Button>
        <Button variant="outline" render={<Link href="/koseki/edit" />}>
          一覧へ戻る
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
