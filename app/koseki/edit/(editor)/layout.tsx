import { requireEditorAuth } from "@/lib/koseki/auth";

export default async function KosekiEditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireEditorAuth();
  return children;
}
