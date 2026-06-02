import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AppShell from "@/components/AppShell";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: tasks }, { data: projects }, { data: profile }] = await Promise.all([
    supabase.from("tasks").select("*").order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);

  return (
    <AppShell
      initialTasks={tasks ?? []}
      initialProjects={projects ?? []}
      initialProfile={profile ?? null}
      userId={user.id}
      userEmail={user.email ?? ""}
    />
  );
}
