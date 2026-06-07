/** `2026-05_総務` または `heldOn` から Pane 1 用の `yyyy_mm` を得る */
export function formatMonthPaneLabel(
  folderSlug: string,
  heldOn?: string
): string {
  const fromSlug = folderSlug.match(/^(\d{4})-(\d{2})/);
  if (fromSlug) return `${fromSlug[1]}_${fromSlug[2]}`;
  const fromDate = heldOn?.match(/^(\d{4})-(\d{2})/);
  if (fromDate) return `${fromDate[1]}_${fromDate[2]}`;
  return folderSlug;
}

/** @deprecated formatMonthPaneLabel を使用 */
export function formatMonthCardTitle(folderSlug: string): string {
  return formatMonthPaneLabel(folderSlug);
}