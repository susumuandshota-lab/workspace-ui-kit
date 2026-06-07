import { describe, expect, it } from "vitest";

import {
  findUnsafeMaterialLinks,
  isSafeExternalUrl,
  parseMaterialLinks,
  parseMeetingMarkdown,
  serializeMeetingMarkdown,
} from "@/lib/koseki/markdown";

const legacySample = `---
status: draft
heldOn: 2026-05-21
theme: テスト
folderSlug: 2026-05_テスト
---

# 2026-05_テスト

## 論点

- 一点目

## 資料リンク

- [資料](https://example.com/doc.pdf)

## 未解決・次回へ

なし

## 次回予定・宿題

- 次回: 未定

## その他メモ

なし
`;

const currentSample = `---
status: published
heldOn: 2026-06-18
theme: 除籍
folderSlug: 2026-06_除籍
---

# 2026-06_除籍

## 事務連絡

- 次回: 2026-07-16

## 協議

- 論点A

## 研修

- 演習メモ

## その他

なし

## 資料

- [配布PDF](https://drive.google.com/example)
`;

describe("koseki markdown", () => {
  it("round-trips legacy headings via migration", () => {
    const parsed = parseMeetingMarkdown("2026-05_テスト", legacySample);
    expect(parsed.frontmatter.theme).toBe("テスト");
    expect(parsed.sections["協議"]).toContain("一点目");
    expect(parsed.sections["その他"]).toContain("なし");

    const serialized = serializeMeetingMarkdown(parsed);
    const again = parseMeetingMarkdown("2026-05_テスト", serialized);
    expect(again.frontmatter).toEqual(parsed.frontmatter);
    expect(again.sections).toEqual(parsed.sections);
  });

  it("parses and serializes current headings including 研修", () => {
    const parsed = parseMeetingMarkdown("2026-06_除籍", currentSample);
    expect(parsed.sections["研修"]).toContain("演習メモ");

    const serialized = serializeMeetingMarkdown(parsed);
    expect(serialized).toContain("## 研修");
    expect(serialized.indexOf("## 協議")).toBeLessThan(serialized.indexOf("## 研修"));
    expect(serialized.indexOf("## 研修")).toBeLessThan(serialized.indexOf("## その他"));
  });

  it("accepts only safe material URLs", () => {
    expect(isSafeExternalUrl("https://example.com/a.pdf")).toBe(true);
    expect(isSafeExternalUrl("http://example.com/a.pdf")).toBe(true);
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("data:text/html,hi")).toBe(false);

    const links = parseMaterialLinks(
      "- [bad](javascript:alert(1))\n- [ok](https://example.com/doc.pdf)"
    );
    expect(links).toEqual([{ label: "ok", href: "https://example.com/doc.pdf" }]);

    expect(findUnsafeMaterialLinks("- [bad](javascript:alert)")).toEqual([
      "javascript:alert",
    ]);
  });
});
