import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { parseDetailContentBlocks } from "@/lib/koseki/detail-content";
import { cn } from "@/lib/utils";

type MeetingDetailContentProps = {
  content: string;
  className?: string;
};

export function MeetingDetailContent({ content, className }: MeetingDetailContentProps) {
  const trimmed = content.trim();

  if (!trimmed) {
    return <p className="text-muted-foreground">（内容なし）</p>;
  }

  if (trimmed === "なし") {
    return <p className="text-muted-foreground">なし</p>;
  }

  const blocks = parseDetailContentBlocks(content);

  if (blocks.length === 0) {
    return <p className="leading-relaxed">{trimmed}</p>;
  }

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          return (
            <div key={key} className="flex flex-col gap-2">
              {index > 0 ? <Separator /> : null}
              <h3 className="font-heading leading-snug">{block.text}</h3>
            </div>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={key} className="flex list-disc flex-col gap-2.5 pl-5 leading-relaxed">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={key} className="leading-relaxed">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

type MeetingDetailPaneBodyProps = {
  content: string;
};

export function MeetingDetailPaneBody({ content }: MeetingDetailPaneBodyProps) {
  return (
    <Card size="sm" className="shadow-sm">
      <CardContent className="pt-4">
        <MeetingDetailContent content={content} />
      </CardContent>
    </Card>
  );
}
