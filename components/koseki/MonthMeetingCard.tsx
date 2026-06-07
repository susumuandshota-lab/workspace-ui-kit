import { Card } from "@/components/ui/card";
import { formatMonthPaneLabel } from "@/lib/koseki/display";
import type { MeetingRecord } from "@/lib/koseki/schema";
import { cn } from "@/lib/utils";

type MonthMeetingCardProps = {
  meeting: MeetingRecord;
  selected: boolean;
  onSelect: () => void;
};

export function MonthMeetingCard({
  meeting,
  selected,
  onSelect,
}: MonthMeetingCardProps) {
  const label = formatMonthPaneLabel(
    meeting.frontmatter.folderSlug,
    meeting.frontmatter.heldOn
  );

  return (
    <button type="button" onClick={onSelect} className="w-full text-left">
      <Card
        size="sm"
        className={cn(
          "gap-0 overflow-hidden rounded-lg py-0 shadow-sm",
          selected && "ring-2 ring-ring"
        )}
      >
        <div className="flex items-center gap-2 rounded-lg bg-koseki-month-header px-3 py-2 font-semibold text-koseki-month-header-foreground">
          <span aria-hidden>📅</span>
          <span className="truncate">{label}</span>
        </div>
      </Card>
    </button>
  );
}
