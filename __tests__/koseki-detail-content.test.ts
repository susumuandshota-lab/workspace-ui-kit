import { describe, expect, it } from "vitest";

import { parseDetailContentBlocks } from "@/lib/koseki/detail-content";

const jimuSample = `支局から
-次回月例会日時　令和８年７月１６日（木）午後１時から
-遺言と相続登記に関する講演会の周知依頼

協議会から
-書籍購入費用について助成する予定`;

const kyogiSample = `・戸籍の届があった場合の処理方法について
・申立てがあった場合の処理方法について`;

describe("parseDetailContentBlocks", () => {
  it("parses group headings and hyphen bullets without space", () => {
    const blocks = parseDetailContentBlocks(jimuSample);
    expect(blocks).toEqual([
      { type: "heading", text: "支局から" },
      {
        type: "list",
        items: [
          "次回月例会日時　令和８年７月１６日（木）午後１時から",
          "遺言と相続登記に関する講演会の周知依頼",
        ],
      },
      { type: "heading", text: "協議会から" },
      { type: "list", items: ["書籍購入費用について助成する予定"] },
    ]);
  });

  it("parses middle-dot bullets", () => {
    const blocks = parseDetailContentBlocks(kyogiSample);
    expect(blocks).toEqual([
      {
        type: "list",
        items: [
          "戸籍の届があった場合の処理方法について",
          "申立てがあった場合の処理方法について",
        ],
      },
    ]);
  });

  it("returns empty for なし", () => {
    expect(parseDetailContentBlocks("なし")).toEqual([]);
  });
});
