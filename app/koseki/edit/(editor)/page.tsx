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
            : "月次ファイルがありません。_template.md を複製して追加してください。"
        }
      />
      {dataSource === "file" ? (
        <p className="mx-auto w-full max-w-3xl px-4 pb-8 text-sm text-muted-foreground">
          新規作成: <code className="text-xs">content/koseki-monthly-meeting/</code> に{" "}
          <code className="text-xs">_template.md</code> を複製してから、ここに表示されます。
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
