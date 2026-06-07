import Link from "next/link";

import { Button } from "@/components/ui/button";

type KosekiHeaderProps = {
  showEditLink?: boolean;
};

export function KosekiHeader({ showEditLink = true }: KosekiHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Link href="/koseki" className="font-heading text-lg leading-snug">
            戸籍研究月例会
          </Link>
          <p className="text-sm text-muted-foreground">会員向けアーカイブ</p>
        </div>
        {showEditLink ? (
          <Button variant="outline" size="sm" render={<Link href="/koseki/edit" />}>
            編集
          </Button>
        ) : null}
      </div>
    </header>
  );
}
