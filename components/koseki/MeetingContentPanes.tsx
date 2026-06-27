"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { defaultContentHeadings } from "@/lib/koseki/schema";

type MeetingContentPanesProps = {
  sections: Record<string, string>;
  onSectionChange: (heading: string, value: string) => void;
  materials: string;
  onMaterialsChange: (value: string) => void;
  theme?: string;
  heldOn?: string;
};

export function MeetingContentPanes({
  sections,
  onSectionChange,
  materials,
  onMaterialsChange,
  theme,
  heldOn,
}: MeetingContentPanesProps) {
  const headings = useMemo(() => [...defaultContentHeadings], []);
  const [selectedHeading, setSelectedHeading] = useState<string | null>(null);

  const activeHeading = useMemo(() => {
    if (headings.length === 0) return null;
    if (selectedHeading && (headings as readonly string[]).includes(selectedHeading)) {
      return selectedHeading;
    }
    return headings[0];
  }, [headings, selectedHeading]);

  const activeContent = activeHeading ? (sections[activeHeading] ?? "") : "";

  return (
    <div className="flex min-h-[420px] flex-1 overflow-hidden rounded-xl border border-border">
      <section className="flex w-[160px] shrink-0 flex-col border-r border-border bg-background">
        <div className="border-b border-border px-3 py-3">
          <h2 className="font-heading text-sm">次第</h2>
          {theme ? (
            <p className="text-xs text-muted-foreground">{theme}</p>
          ) : null}
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <ul className="flex flex-col gap-0.5 p-2">
            {headings.map((heading) => (
              <li key={heading}>
                <button
                  type="button"
                  onClick={() => setSelectedHeading(heading)}
                  className={cn(
                    "w-full rounded-lg px-2 py-2 text-left text-sm transition-colors",
                    activeHeading === heading
                      ? "bg-muted text-foreground"
                      : "hover:bg-muted/60"
                  )}
                >
                  {heading}
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </section>

      <section className="min-w-0 flex-1 bg-canvas">
        <div className="border-b border-border px-6 py-3">
          <h2 className="font-heading text-sm">内容</h2>
          {activeHeading ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{activeHeading}</span>
              {heldOn ? <Badge variant="secondary">{heldOn}</Badge> : null}
            </div>
          ) : null}
        </div>
        <div className="flex h-[calc(100%-3.5rem)] flex-col px-6 py-4">
          {!activeHeading ? (
            <p className="text-sm text-muted-foreground">次第を選択してください</p>
          ) : (
            <>
              <Textarea
                id={`section-editor-${activeHeading}`}
                value={activeContent}
                onChange={(e) => onSectionChange(activeHeading, e.target.value)}
                rows={16}
                className="min-h-0 flex-1 resize-none font-mono text-sm"
                placeholder={
                  activeHeading === "研修" || activeHeading === "その他"
                    ? "なし"
                    : "- 箇条書きで入力\n- 改行で区切る"
                }
              />
              <p className="mt-2 text-xs text-muted-foreground">
                箇条書きは行頭に <code className="text-[0.7rem]">- </code>{" "}
                を付けてください。左の次第を切り替えると、それぞれの欄を編集できます。
              </p>
            </>
          )}
        </div>
      </section>

      <section className="flex w-[280px] shrink-0 flex-col border-l border-border bg-card">
        <div className="border-b border-border px-3 py-3">
          <h2 className="font-heading text-sm">資料</h2>
          <p className="text-xs text-muted-foreground">[表示名](URL) 形式</p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <Textarea
            id="section-editor-materials"
            value={materials}
            onChange={(e) => onMaterialsChange(e.target.value)}
            rows={16}
            className="min-h-0 flex-1 resize-none font-mono text-sm"
            placeholder="- [資料名](https://drive.google.com/...)"
          />
        </div>
      </section>
    </div>
  );
}
