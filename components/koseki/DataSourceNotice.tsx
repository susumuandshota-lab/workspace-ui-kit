import { getKosekiDataSource } from "@/lib/koseki/meetings";

export function DataSourceNotice() {
  const source = getKosekiDataSource();

  if (source === "database") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-1 px-4 text-xs text-muted-foreground">
        <p>
          保存先:{" "}
          <span className="font-medium text-foreground">Neon データベース</span>
          （書記の編集はここに保存されます）
        </p>
        <p>
          Git バックアップ: ローカル保存時は Markdown に自動反映。本番サーバーでは運営コアが{" "}
          <code className="text-[11px]">npm run db:export</code> → commit で反映します。
        </p>
      </div>
    );
  }

  return (
    <p className="mx-auto w-full max-w-3xl px-4 text-xs text-amber-700 dark:text-amber-400">
      保存先: <span className="font-medium">ローカル Markdown ファイル</span>
      。書記運用では DB モード（<code className="text-[11px]">KOSEKI_DATA_SOURCE=database</code>）を使ってください。
    </p>
  );
}
