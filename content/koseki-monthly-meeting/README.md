# 戸籍研究月例会 — 運用テンプレ

資料原本は **クラウド（Google ドライブ等）**、テキスト記録は **Neon（編集の正）＋ Git（バックアップ）** です。

## 役割分担

| 誰 | やること |
|----|----------|
| **書記** | `/koseki/edit` でドラフト→清書（方法Aのみ。Markdown を直接編集しない） |
| **運営コア** | `npm run db:export` → Git commit（本番編集後は必須。ローカル編集時は自動反映される場合あり） |
| **会員** | `/koseki` で閲覧（`published` のみ） |

| 置き場 | 中身 |
|--------|------|
| Neon（DB） | 編集の正本。書記の保存先 |
| このリポジトリ `content/koseki-monthly-meeting/*.md` | Git バックアップ（`db:export` で DB から生成） |
| クラウド `月例会アーカイブ/` | PDF・画像などの原本。リポジトリには載せない |

## 書記の流れ（方法Aのみ）

1. **開催日当日** — `/koseki/edit` →「新規作成」→ `status: draft` のまま必須項目を埋める
2. **1週間以内** — 清書し `status: published` に変更（書記＋運営コアが確認）
3. **資料** — `01_資料/` にアップロードし、編集画面の「資料」に URL を貼る

書記は **Markdown ファイルや Git を触りません**。

## 運営コアの流れ（Git バックアップ）

### 毎月（または清書公開後）

```bash
npm run db:export
git add content/koseki-monthly-meeting/
git commit -m "chore(koseki): export monthly meeting records"
git push
```

- `db:export` は Neon の全回次を Markdown に書き出します
- DB にない古い `.md` は削除されます（DB が正）

### ローカルで書記が編集した場合

開発マシンでは保存と同時に Markdown へ自動反映されることがあります。  
それでも **commit 前に `db:export` を実行**して差分を確認してください。

### 初回セットアップ・DB 復旧のみ（書記は使わない）

Markdown から DB へ戻すときだけ:

```bash
npm run db:setup          # 空 DB への初回投入
npm run db:seed -- --prune  # ファイルにない DB 回次を削除して上書き（要注意）
```

通常運用では `db:seed` は使いません。

## Google ドライブ側のフォルダ構成

```
月例会アーカイブ/
└── YYYY-MM_短いテーマ/          … 例: 2026-05_除籍の読み方
    └── 01_資料/                 … 配布PDF・スキャン等（ファイル名は原本のまま）
```

- フォルダ名は **`YYYY-MM_短いテーマ`** に統一（回数ではなくテーマ基準）
- 録画・会場写真は置かない（概要メモと事前共有資料のみ）

## 見出し構成（現行）

| 見出し | 内容 |
|--------|------|
| 事務連絡 | 次回予定・宿題・出欠など |
| 協議 | 当日の論点・未解決事項 |
| 研修 | 研修内容（なければ「なし」） |
| その他 | 上記に当てはまらないメモ |
| 資料 | `[表示名](https://...)` 形式のリンク |

## 忙しい月（最小限）

- 開催日
- 協議（箇条書き）
- 資料（リンク）
- 事務連絡（次回予定・宿題）

## ファイル一覧

| ファイル | 用途 |
|----------|------|
| `_template.md` | 見本（書記は複製しない。運営・開発の参照用） |
| `2026-05_総務.md` | 現在の記録例 |
| `drive-stub/` | ドライブに作るフォルダ構成の見本 |

## Web アプリ

| URL | 用途 |
|-----|------|
| `/koseki` | 公開済み（`published`）の一覧・詳細 |
| `/koseki/edit` | 書記向け編集（要 `KOSEKI_EDIT_PASSWORD`） |

環境変数（`.env.local`）:

- `KOSEKI_EDIT_PASSWORD` — 編集画面用
- `KOSEKI_DATA_SOURCE=database` — 書記運用では必須
- `DATABASE_URL` — Neon 接続文字列

- `draft` は編集画面のみ。`published` だけ会員向け一覧に表示
- 資料リンクは `http://` / `https://` のみ
- カレンダー連携・コメント機能は MVP 対象外
