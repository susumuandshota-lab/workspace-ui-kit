import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const KOSEKI_EDITOR_COOKIE = "koseki-editor";

export function getEditPassword(): string | undefined {
  return process.env.KOSEKI_EDIT_PASSWORD;
}

export function isEditorPasswordValid(password: string): boolean {
  const expected = getEditPassword();
  if (!expected || expected.length === 0) return false;
  return password === expected;
}

export async function isEditorAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(KOSEKI_EDITOR_COOKIE)?.value === "1";
}

export async function requireEditorAuth(): Promise<void> {
  if (!(await isEditorAuthenticated())) {
    redirect("/koseki/edit/login");
  }
}
