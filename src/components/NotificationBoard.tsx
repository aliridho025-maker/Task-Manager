"use client";

import { useMemo } from "react";
import type { Task } from "./types";

const PRIO_COLOR = { tinggi: "var(--red)", sedang: "var(--amber)", rendah: "var(--green)" };

export default function NotificationBoard({
  initialTasks, onOpenTask,
}: { initialTasks: Task[]; onOpenTask?: (t: Task) => void }) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const { baru, tenggat } = useMemo(() => {
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const in3 = new Date(now.getTime() + 3 * 86400000).toISOString().slice(0, 10);

    const baru = initialTasks
      .filter((t) => t.created_at && new Date(t.created_at) >= weekAgo)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

    const tenggat = initialTasks
      .filter((t) => t.status !== "selesai" && t.due_date && t.due_date <= in3)
      .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1));

    return { baru, tenggat };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTasks]);

  const fmt = (d: string) => new Date(d + "T00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const fmtRel = (iso: string) => {
    const diff = Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000);
    if (diff <= 0) return "Hari ini";
    if (diff === 1) return "Kemarin";
    return `${diff} hari lalu`;
  };

  const empty = baru.length === 0 && tenggat.length === 0;

  return (
    <div className="pad" style={{ paddingTop: 8, paddingBottom: 100 }}>
      {empty && (
        <div style={{ textAlign: "center", color: "var(--faint)", padding: "70px 20px", fontSize: 15 }}>
          Tidak ada notifikasi.
        </div>
      )}

      {tenggat.length > 0 && (
        <>
          <div style={{ fontSize: 13, color: "var(--faint)", fontWeight: 600, margin: "8px 0 10px" }}>PENGINGAT TENGGAT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {tenggat.map((t) => {
              const late = t.due_date! < todayStr;
              return (
                <div key={t.id} onClick={() => onOpenTask?.(t)}
                  style={{ background: "var(--surface)", border: "1px solid var(--line)", borderLeft: `4px solid ${late ? "var(--red)" : "var(--amber)"}`, borderRadius: "var(--radius)", padding: "13px 15px", boxShadow: "var(--shadow)", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                    <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: late ? "var(--red)" : "var(--amber)" }}>
                      {late ? "⚠ Lewat " : "Jatuh tempo "}{fmt(t.due_date!)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {baru.length > 0 && (
        <>
          <div style={{ fontSize: 13, color: "var(--faint)", fontWeight: 600, margin: "8px 0 10px" }}>TUGAS BARU (7 HARI TERAKHIR)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {baru.map((t) => (
              <div key={t.id} onClick={() => onOpenTask?.(t)}
                style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "13px 15px", boxShadow: "var(--shadow)", cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: PRIO_COLOR[t.priority], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                  {t.category && <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 1 }}>{t.category}</div>}
                </div>
                <span style={{ flexShrink: 0, fontSize: 12, color: "var(--faint)" }}>{fmtRel(t.created_at)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
