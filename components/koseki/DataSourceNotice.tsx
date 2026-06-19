import { getKosekiDataSource } from "@/lib/koseki/meetings";

export function DataSourceNotice() {
  const source = getKosekiDataSource();

  if (source === "database") {
    return (
      <p className="mx-auto w-full max-w-3xl px-4 text-xs text-muted-foreground">
        保存先: <span className="font-medium text-foreground">Neon データベース</span>
        （編集内容はクラウドに記憶されます）
      </p>
    );
  }

  return (
    <p className="mx-auto w-full max-w-3xl px-4 text-xs text-amber-700 dark:text-amber-400">
      保存先: <span className="font-medium">ローカル Markdown ファイル</span>
      。Vercel 上では読み取りのみです。永続化するには Neon を接続してください。
    </p>
  );
}
