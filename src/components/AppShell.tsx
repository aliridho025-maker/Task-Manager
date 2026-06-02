"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TaskBoard from "./TaskBoard";
import FinanceBoard, { type Project } from "./FinanceBoard";
import NotificationBoard from "./NotificationBoard";
import ProfileBoard, { type Profile } from "./ProfileBoard";
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

  function handleAdd() {
    setTab("tugas");
    setAddSignal((n) => n + 1);
  }

  return (
    <div className="shell">
      <div className="pad" style={{ paddingTop: 22, paddingBottom: 4 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px" }}>{TITLES[tab]}</h1>
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

      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 560, background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(12px)", borderTop: "1px solid var(--line)",
        display: "flex", alignItems: "center", paddingBottom: "env(safe-area-inset-bottom)", zIndex: 25,
      }}>
        <TabBtn label="Tugas" active={tab === "tugas"} onClick={() => setTab("tugas")}
          path="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        <TabBtn label="Keuangan" active={tab === "keuangan"} onClick={() => setTab("keuangan")}
          path="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <button onClick={handleAdd} aria-label="Tambah tugas"
            style={{ width: 52, height: 52, borderRadius: 16, background: "var(--brand)", marginTop: -18, boxShadow: "0 6px 18px rgba(51,72,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
      style={{ flex: 1, background: "none", padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? "var(--brand)" : "var(--faint)" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
      <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
    </button>
  );
}
