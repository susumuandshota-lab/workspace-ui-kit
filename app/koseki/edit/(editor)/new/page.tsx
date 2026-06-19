import { MeetingCreateForm } from "@/components/koseki/MeetingCreateForm";
import { getKosekiDataSource } from "@/lib/koseki/meetings";
import { redirect } from "next/navigation";

export default function KosekiEditNewPage() {
  if (getKosekiDataSource() !== "database") {
    redirect("/koseki/edit");
  }

  return <MeetingCreateForm />;
}
