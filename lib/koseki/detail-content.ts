export type DetailContentBlock =
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

const BULLET_RE = /^[・\-*]\s*(.+)/;

function isGroupHeading(line: string): boolean {
  const t = line.trim();
  if (t.length === 0 || t.length > 24) return false;
  if (BULLET_RE.test(t)) return false;
  if (t.endsWith("。")) return false;
  return t.endsWith("から") || t.endsWith("より") || !/[、。]/.test(t);
}

/** 第3ペイン用: 事務連絡・協議テキストを見出し・箇条書き・段落に分解 */
export function parseDetailContentBlocks(content: string): DetailContentBlock[] {
  const trimmed = content.trim();
  if (!trimmed || trimmed === "なし") return [];

  const lines = content.split(/\r?\n/);
  const blocks: DetailContentBlock[] = [];
  let listItems: string[] = [];
  let paragraphLines: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({ type: "list", items: listItems });
    listItems = [];
  };

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    const text = paragraphLines.join("\n").trim();
    paragraphLines = [];
    if (!text) return;

    if (text.split("\n").length === 1 && isGroupHeading(text)) {
      blocks.push({ type: "heading", text });
      return;
    }

    blocks.push({ type: "paragraph", text });
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flushList();
      flushParagraph();
      continue;
    }

    const bullet = t.match(BULLET_RE);
    if (bullet) {
      flushParagraph();
      listItems.push(bullet[1].trim());
      continue;
    }

    flushList();
    paragraphLines.push(t);
  }

  flushList();
  flushParagraph();

  return blocks;
}
