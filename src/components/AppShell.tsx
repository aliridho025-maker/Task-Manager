"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TaskBoard from "./TaskBoard";
import FinanceBoard, { type Project } from "./FinanceBoard";
import NotificationBoard from "./NotificationBoard";
import ProfileBoard, { type Profile } from "./ProfileBoard";
import { useRealtime } from "./useRealtime";
import type { Task } from "./types";

type Tab = "tugas" | "keuangan" | "notifikasi" | "profil";

const TITLES: Record<Tab, string> = {
  tugas: "Tugas Saya",
  keuangan: "Keuangan",
  notifikasi: "Notifikasi",
  profil: "Profil",
};

export default function AppShell({
  initialTasks, initialProjects, initialProfile, userId, userEmail,
}: {
  initialTasks: Task[];
  initialProjects: Project[];
  initialProfile: Profile | null;
  userId: string;
  userEmail: string;
}) {
  const [tab, setTab] = useState<Tab>("tugas");
  const [addSignal, setAddSignal] = useState(0);
  const router = useRouter();

  useRealtime(["tasks", "projects"], () => router.refresh());

  function handleAdd() {
    setTab("tugas");
    setAddSignal((n) => n + 1);
  }

  return (
    <div className="shell">
      <div className="glass-soft" style={{ position: "sticky", top: 0, zIndex: 20, padding: "calc(env(safe-area-inset-top) + 18px) 18px 12px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>{TITLES[tab]}</h1>
      </div>

      {tab === "tugas" && (
        <TaskBoard initialTasks={initialTasks} onProjectCreated={() => router.refresh()} openSignal={addSignal} />
      )}
      {tab === "keuangan" && <FinanceBoard initialProjects={initialProjects} />}
      {tab === "notifikasi" && (
        <NotificationBoard initialTasks={initialTasks} onOpenTask={() => setTab("tugas")} />
      )}
      {tab === "profil" && (
        <ProfileBoard initialProfile={initialProfile} userId={userId} userEmail={userEmail} />
      )}

      <nav className="glass" style={{
        position: "fixed", bottom: "calc(env(safe-area-inset-bottom) + 12px)", left: "50%", transform: "translateX(-50%)",
        width: "calc(100% - 28px)", maxWidth: 460, borderRadius: 28,
        display: "flex", alignItems: "center", padding: "8px 6px", zIndex: 25,
        boxShadow: "0 8px 32px rgba(20,20,60,0.18), inset 0 1px 0 rgba(255,255,255,0.7)",
      }}>
        <TabBtn label="Tugas" active={tab === "tugas"} onClick={() => setTab("tugas")}
          path="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        <TabBtn label="Keuangan" active={tab === "keuangan"} onClick={() => setTab("keuangan")}
          path="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <button onClick={handleAdd} aria-label="Tambah tugas"
            style={{ width: 50, height: 50, borderRadius: 17, background: "var(--brand)", boxShadow: "0 6px 18px rgba(51,72,255,0.45), inset 0 1px 0 rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        <TabBtn label="Notifikasi" active={tab === "notifikasi"} onClick={() => setTab("notifikasi")}
          path="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
        <TabBtn label="Profil" active={tab === "profil"} onClick={() => setTab("profil")}
          path="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      </nav>
    </div>
  );
}

function TabBtn({ label, active, onClick, path }: { label: string; active: boolean; onClick: () => void; path: string }) {
  return (
    <button onClick={onClick}
      style={{ flex: 1, background: "none", padding: "8px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? "var(--brand)" : "var(--faint)" }}>
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
      <span style={{ fontSize: 10.5, fontWeight: 600 }}>{label}</span>
    </button>
  );
}
