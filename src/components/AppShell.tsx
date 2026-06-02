"use client";

import { useState } from "react";
import TaskBoard from "./TaskBoard";
import FinanceBoard, { type Project } from "./FinanceBoard";

type Task = Parameters<typeof TaskBoard>[0]["initialTasks"][number];

export default function AppShell({
  initialTasks, initialProjects, userEmail,
}: { initialTasks: Task[]; initialProjects: Project[]; userEmail: string }) {
  const [tab, setTab] = useState<"tugas" | "keuangan">("tugas");

  return (
    <div className="shell">
      <div className="pad" style={{ paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px" }}>
            {tab === "tugas" ? "Tugas Saya" : "Keuangan"}
          </h1>
          <p style={{ color: "var(--faint)", fontSize: 13, marginTop: 2 }}>{userEmail}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" title="Keluar"
            style={{ background: "var(--surface-2)", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </form>
      </div>

      {tab === "tugas"
        ? <TaskBoard initialTasks={initialTasks} />
        : <FinanceBoard initialProjects={initialProjects} />}

      {/* Tab bar bawah */}
      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 560, background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)", borderTop: "1px solid var(--line)",
        display: "flex", paddingBottom: "env(safe-area-inset-bottom)", zIndex: 25,
      }}>
        {([["tugas", "Tugas", "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"],
           ["keuangan", "Keuangan", "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"]] as const).map(
          ([key, label, path]) => {
            const active = tab === key;
            return (
              <button key={key} onClick={() => setTab(key)}
                style={{ flex: 1, background: "none", padding: "11px 0 13px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? "var(--brand)" : "var(--faint)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
              </button>
            );
          }
        )}
      </nav>
    </div>
  );
}
