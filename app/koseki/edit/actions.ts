"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  isEditorAuthenticated,
  isEditorPasswordValid,
  KOSEKI_EDITOR_COOKIE,
} from "@/lib/koseki/auth";
import { findUnsafeMaterialLinks } from "@/lib/koseki/markdown";
import { loadMeeting, saveMeeting } from "@/lib/koseki/meetings";
import {
  defaultContentHeadings,
  meetingEditFormSchema,
  type MeetingSections,
} from "@/lib/koseki/schema";

export type SaveMeetingState = {
  ok: boolean;
  message: string;
};

export async function loginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (!isEditorPasswordValid(password)) {
    redirect("/koseki/edit/login?error=1");
  }

  const store = await cookies();
  store.set(KOSEKI_EDITOR_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  redirect("/koseki/edit");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(KOSEKI_EDITOR_COOKIE);
  redirect("/koseki/edit/login");
}

export async function saveMeetingAction(
  _prev: SaveMeetingState,
  formData: FormData
): Promise<SaveMeetingState> {
  if (!(await isEditorAuthenticated())) {
    return { ok: false, message: "編集権限がありません。再ログインしてください。" };
  }

  const contentSections: Record<string, string> = {};
  for (const key of defaultContentHeadings) {
    contentSections[key] = String(formData.get(`section_${key}`) ?? "").trim();
  }

  const parsed = meetingEditFormSchema.safeParse({
    slug: String(formData.get("slug") ?? ""),
    status: String(formData.get("status") ?? ""),
    heldOn: String(formData.get("heldOn") ?? ""),
    theme: String(formData.get("theme") ?? ""),
    folderSlug: String(formData.get("folderSlug") ?? ""),
    contentSections,
    materials: String(formData.get("section_資料") ?? "").trim(),
  });

  if (!parsed.success) {
    return { ok: false, message: "入力内容を確認してください。" };
  }

  const { slug, contentSections: content, materials, ...frontmatter } = parsed.data;
  const unsafeLinks = findUnsafeMaterialLinks(materials);
  if (unsafeLinks.length > 0) {
    return {
      ok: false,
      message: "資料リンクは http:// または https:// の URL のみ使用できます。",
    };
  }

  const sections: MeetingSections = { ...content, 資料: materials };

  try {
    await loadMeeting(slug);
    await saveMeeting({
      slug,
      frontmatter: {
        status: frontmatter.status,
        heldOn: frontmatter.heldOn,
        theme: frontmatter.theme,
        folderSlug: frontmatter.folderSlug,
      },
      sections,
    });
    revalidatePath("/koseki");
    revalidatePath("/koseki/edit");
    revalidatePath(`/koseki/edit/${slug}`);
    return { ok: true, message: "保存しました。" };
  } catch {
    return { ok: false, message: "保存に失敗しました。" };
  }
}
