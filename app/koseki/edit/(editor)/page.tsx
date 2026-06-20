import Link from "next/link";

import { logoutAction } from "@/app/koseki/edit/actions";
import { DataSourceNotice } from "@/components/koseki/DataSourceNotice";
import { MeetingList } from "@/components/koseki/MeetingList";
import { Button } from "@/components/ui/button";
import { getKosekiDataSource, loadMeetings } from "@/lib/koseki/meetings";

export default async function KosekiEditIndexPage() {
  const meetings = await loadMeetings();
  const dataSource = getKosekiDataSource();

  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4 pt-6">
        <p className="text-sm text-muted-foreground">
          下書きを含む全回次。公開するには各回を編集して status を published にしてください。
        </p>
        <div className="flex flex-wrap gap-2">
          {dataSource === "database" ? (
            <Button render={<Link href="/koseki/edit/new" />} size="sm">
              新規作成
            </Button>
          ) : null}
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              ログアウト
            </Button>
          </form>
        </div>
      </div>
      <DataSourceNotice />
      <MeetingList
        meetings={meetings}
        basePath="/koseki/edit"
        showStatus
        emptyMessage={
          dataSource === "database"
            ? "月次がありません。「新規作成」から追加してください。"
            : "月次がありません。データベースモードで運用してください。"
        }
      />
      {dataSource === "database" ? (
        <p className="mx-auto w-full max-w-3xl px-4 pb-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">運営コア向け:</span> 書記の保存後、{" "}
          <code className="text-xs">npm run db:export</code> で Markdown を更新し、Git に commit
          してください（本番サーバーで編集した場合は必須）。
        </p>
      ) : null}
      <div className="mx-auto w-full max-w-3xl px-4 pb-8">
        <Button variant="link" render={<Link href="/koseki" />}>
          公開アーカイブを見る
        </Button>
      </div>
    </div>
  );
}
