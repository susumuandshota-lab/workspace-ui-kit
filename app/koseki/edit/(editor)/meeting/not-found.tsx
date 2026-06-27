import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function KosekiEditMeetingNotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-16">
      <h1 className="font-heading text-lg">回次が見つかりません（404）</h1>
      <p className="text-sm text-muted-foreground">
        この回次はデータベースにありません。編集一覧から開き直すか、保存が完了しているか確認してください。
      </p>
      <div className="flex flex-wrap gap-2">
        <Button render={<Link href="/koseki/edit" />}>編集一覧へ</Button>
        <Button variant="outline" render={<Link href="/koseki/edit/new" />}>
          新規作成
        </Button>
      </div>
    </div>
  );
}
