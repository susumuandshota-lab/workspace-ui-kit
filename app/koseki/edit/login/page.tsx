import Link from "next/link";

import { loginAction } from "@/app/koseki/edit/actions";
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
import { getEditPassword } from "@/lib/koseki/auth";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function KosekiEditLoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const configured = Boolean(getEditPassword());

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>編集ログイン</CardTitle>
          <CardDescription>
            書記・運営コア向け。共有パスワードを入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!configured ? (
            <p className="text-sm text-destructive">
              環境変数 <code className="text-xs">KOSEKI_EDIT_PASSWORD</code>{" "}
              が未設定です。.env.local を確認してください。
            </p>
          ) : (
            <form action={loginAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              {error ? (
                <p className="text-sm text-destructive">パスワードが正しくありません。</p>
              ) : null}
              <Button type="submit">ログイン</Button>
            </form>
          )}
        </CardContent>
      </Card>
      <Button variant="link" render={<Link href="/koseki" />}>
        アーカイブ一覧へ
      </Button>
    </div>
  );
}
