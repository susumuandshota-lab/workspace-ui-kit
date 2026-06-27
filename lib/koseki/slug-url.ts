/** 動的パス用: slug を URL セグメントにエンコード */
export function meetingSlugToPathSegment(slug: string): string {
  return encodeURIComponent(slug);
}

/** リクエストから slug を復元（二重エンコードにも耐性） */
export function normalizeMeetingSlugFromParam(raw: string): string {
  let slug = raw.trim();
  for (let i = 0; i < 2; i++) {
    if (!slug.includes("%")) break;
    try {
      slug = decodeURIComponent(slug);
    } catch {
      break;
    }
  }
  return slug.normalize("NFC");
}

/** 編集画面へのリンク（日本語 slug でも確実に開く） */
export function kosekiEditMeetingHref(slug: string): string {
  return `/koseki/edit/meeting?slug=${encodeURIComponent(slug)}`;
}

/** 公開アーカイブへのリンク */
export function kosekiArchiveMeetingHref(slug: string): string {
  return `/koseki/${meetingSlugToPathSegment(slug)}`;
}
