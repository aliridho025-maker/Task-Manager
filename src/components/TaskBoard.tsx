"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";

type Task = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: "tinggi" | "sedang" | "rendah";
  status: "todo" | "proses" | "selesai";
  due_date: string | null;
  budget: number;
  project_id: string | null;
};

const PRIO_RANK = { tinggi: 0, sedang: 1, rendah: 2 };
const PRIO_COLOR = { tinggi: "var(--red)", sedang: "var(--amber)", rendah: "var(--green)" };

export default function TaskBoard({
  initialTasks, onProjectCreated,
}: { initialTasks: Task[]; onProjectCreated?: () => void }) {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState("all");
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<Task | null>(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("");
  const [prio, setPrio] = useState<Task["priority"]>("sedang");
  const [due, setDue] = useState("");
  const [budget, setBudget] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const isLate = (t: Task) => !!t.due_date && t.status !== "selesai" && t.due_date < today;

  function resetForm() { setTitle(""); setDesc(""); setCat(""); setDue(""); setPrio("sedang"); setBudget(""); }

  async function addTask() {
    if (!title.trim() || busy) return;
    setBusy(true);
    const budgetNum = (() => { const n = parseFloat(budget.replace(/[^\d.]/g, "")); return isNaN(n) ? 0 : n; })();

    let projectId: string | null = null;
    // Budget diisi → otomatis buat proyek baru (sekali cipta), budget jadi nilai/pemasukan.
    if (budgetNum > 0) {
      const { data: proj, error: pErr } = await supabase.from("projects").insert({
        name: title.trim(), value: budgetNum, paid: 0, expense: 0, payment_status: "belum",
      }).select().single();
      if (pErr) { setBusy(false); alert("Gagal membuat proyek: " + pErr.message); return; }
      if (proj) { projectId = proj.id; onProjectCreated?.(); }
    }

    const { data, error } = await supabase.from("tasks").insert({
      title: title.trim(), description: desc.trim() || null, category: cat.trim() || null,
      priority: prio, due_date: due || null, status: "todo",
      budget: budgetNum, project_id: projectId,
    }).select().single();
    setBusy(false);
    if (error) { alert("Gagal menyimpan: " + error.message); return; }
    if (data) { setTasks((p) => [...p, data as Task]); resetForm(); setSheet(false); }
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    const { error } = await supabase.from("tasks").update(patch).eq("id", id);
    if (error) alert("Gagal memperbarui: " + error.message);
  }

  async function delTask(id: string) {
    setTasks((p) => p.filter((t) => t.id !== id));
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
  }

  const shown = useMemo(() => {
    const list = tasks.filter((t) => {
      if (filter === "all") return true;
      if (filter === "tinggi") return t.priority === "tinggi";
      if (filter === "todo") return t.status === "todo";
      return t.status === filter;
    });
    return list.sort((a, b) => {
      const ad = a.due_date ?? "9999", bd = b.due_date ?? "9999";
      if (ad !== bd) return ad < bd ? -1 : 1;
      return PRIO_RANK[a.priority] - PRIO_RANK[b.priority];
    });
  }, [tasks, filter]);

  const stats = {
    todo: tasks.filter((t) => t.status !== "selesai").length,
    done: tasks.filter((t) => t.status === "selesai").length,
    late: tasks.filter(isLate).length,
  };

  const fmt = (d: string | null) =>
    d ? new Date(d + "T00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "";

  const FILTERS: [string, string][] = [
    ["all", "Semua"], ["todo", "Belum"], ["proses", "Proses"], ["selesai", "Selesai"], ["tinggi", "Penting"],
  ];

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Statistik ringkas */}
      <div className="pad" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {([["Belum", stats.todo, "var(--brand)"], ["Selesai", stats.done, "var(--green)"], ["Telat", stats.late, "var(--red)"]] as const).map(
            ([label, val, color]) => (
              <div key={label} style={{ flex: 1, background: "var(--surface-2)", borderRadius: "var(--radius)", padding: "12px 14px" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>{label}</div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Filter — scroll horizontal */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "14px 18px", scrollbarWidth: "none" }}>
        {FILTERS.map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              flexShrink: 0, padding: "8px 16px", fontSize: 14, fontWeight: 600, borderRadius: 999,
              background: filter === f ? "var(--brand)" : "var(--surface-2)",
              color: filter === f ? "#fff" : "var(--muted)",
            }}>{label}</button>
        ))}
      </div>

      {/* Daftar tugas */}
      <div className="pad" style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
        {shown.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--faint)", padding: "70px 20px", fontSize: 15 }}>
            Belum ada tugas di sini.<br />Ketuk tombol + untuk menambah.
          </div>
        ) : (
          shown.map((t) => {
            const done = t.status === "selesai";
            const late = isLate(t);
            const STATUS_BADGE: Record<Task["status"], { label: string; bg: string; color: string }> = {
              todo: { label: "Belum", bg: "var(--surface-2)", color: "var(--muted)" },
              proses: { label: "Proses", bg: "var(--amber-soft)", color: "var(--amber)" },
              selesai: { label: "Selesai", bg: "var(--green-soft)", color: "var(--green)" },
            };
            const sb = STATUS_BADGE[t.status];
            return (
              <div key={t.id} style={{
                background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)",
                padding: 14, display: "flex", gap: 13, alignItems: "flex-start", boxShadow: "var(--shadow)", opacity: done ? 0.6 : 1,
              }}>
                <div onClick={() => setDetail(t)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: PRIO_COLOR[t.priority], flexShrink: 0 }} />
                    <span style={{ fontSize: 16, fontWeight: 600, textDecoration: done ? "line-through" : "none", color: done ? "var(--muted)" : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                  </div>
                  {t.description && <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4, paddingLeft: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>}
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 9, paddingLeft: 14, alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 7, background: sb.bg, color: sb.color }}>{sb.label}</span>
                    {t.category && <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 7, background: "var(--brand-soft)", color: "var(--brand)" }}>{t.category}</span>}
                    {Number(t.budget) > 0 && <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 7, background: "var(--green-soft)", color: "var(--green)" }}>Rp {Math.round(Number(t.budget)).toLocaleString("id-ID")}</span>}
                    {t.due_date && <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 7, background: late ? "var(--red-soft)" : "var(--surface-2)", color: late ? "var(--red)" : "var(--muted)" }}>{late ? "⚠ " : ""}{fmt(t.due_date)}</span>}
                  </div>
                </div>

                <button onClick={() => delTask(t.id)} title="Hapus"
                  style={{ background: "none", padding: 4, flexShrink: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* FAB */}
      <button onClick={() => { resetForm(); setSheet(true); }}
        style={{
          position: "fixed", bottom: 90, right: "max(18px, calc(50% - 280px + 18px))",
          width: 58, height: 58, borderRadius: 18, background: "var(--brand)",
          boxShadow: "0 6px 20px rgba(51,72,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 20,
        }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      {/* Bottom sheet tambah tugas */}
      {sheet && (
        <div onClick={() => setSheet(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(20,20,26,0.4)", zIndex: 30, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 560, background: "var(--surface)", borderRadius: "22px 22px 0 0", padding: "10px 18px 28px", boxShadow: "var(--shadow-lg)" }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, background: "var(--line-strong)", margin: "0 auto 18px" }} />
            <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 16 }}>Tugas baru</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <input autoFocus placeholder="Apa yang perlu dikerjakan?" value={title}
                onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} />
              <textarea placeholder="Catatan (opsional)" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} style={{ resize: "none" }} />
              <input placeholder="Kategori / proyek" value={cat} onChange={(e) => setCat(e.target.value)} />
              <div style={{ display: "flex", gap: 10 }}>
                <select value={prio} onChange={(e) => setPrio(e.target.value as Task["priority"])} style={{ flex: 1 }}>
                  <option value="tinggi">Penting</option>
                  <option value="sedang">Sedang</option>
                  <option value="rendah">Rendah</option>
                </select>
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} style={{ flex: 1 }} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, display: "block", marginBottom: 5 }}>Budget / nilai (opsional)</label>
                <input inputMode="numeric" placeholder="0" value={budget} onChange={(e) => setBudget(e.target.value)} />
                {budget && parseFloat(budget.replace(/[^\d.]/g, "")) > 0 && (
                  <p style={{ fontSize: 12, color: "var(--brand)", marginTop: 6 }}>
                    Proyek &ldquo;{title || "tanpa judul"}&rdquo; akan dibuat otomatis di Keuangan sebagai pemasukan.
                  </p>
                )}
              </div>
              <button className="btn-brand" onClick={addTask} disabled={busy} style={{ marginTop: 4 }}>
                {busy ? "Menyimpan..." : "Tambah tugas"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detail tugas */}
      {detail && (() => {
        const t = detail;
        const late = isLate(t);
        const STATUS_OPTS: [Task["status"], string][] = [["todo", "Belum"], ["proses", "Proses"], ["selesai", "Selesai"]];
        return (
          <div onClick={() => setDetail(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(20,20,26,0.4)", zIndex: 35, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 560, background: "var(--surface)", borderRadius: "22px 22px 0 0", padding: "10px 18px 28px", maxHeight: "90dvh", overflowY: "auto", boxShadow: "var(--shadow-lg)" }}>
              <div style={{ width: 40, height: 4, borderRadius: 999, background: "var(--line-strong)", margin: "0 auto 18px" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: PRIO_COLOR[t.priority], flexShrink: 0 }} />
                <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>{t.title}</h2>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                Prioritas {t.priority === "tinggi" ? "penting" : t.priority}
              </p>

              {t.description && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: "var(--faint)", fontWeight: 600, marginBottom: 4 }}>CATATAN</div>
                  <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{t.description}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <div style={{ flex: 1, background: "var(--surface-2)", borderRadius: "var(--radius)", padding: "12px 14px" }}>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Kategori</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{t.category || "—"}</div>
                </div>
                <div style={{ flex: 1, background: "var(--surface-2)", borderRadius: "var(--radius)", padding: "12px 14px" }}>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Tenggat</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2, color: late ? "var(--red)" : "var(--text)" }}>{t.due_date ? fmt(t.due_date) : "—"}{late ? " ⚠" : ""}</div>
                </div>
              </div>

              {Number(t.budget) > 0 && (
                <div style={{ background: "var(--green-soft)", borderRadius: "var(--radius)", padding: "12px 14px", marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: "var(--green)" }}>Budget / nilai (tercatat di Keuangan)</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--green)", marginTop: 2 }}>Rp {Math.round(Number(t.budget)).toLocaleString("id-ID")}</div>
                </div>
              )}

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 8 }}>Status progress</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {STATUS_OPTS.map(([val, label]) => {
                    const active = t.status === val;
                    return (
                      <button key={val}
                        onClick={() => { updateTask(t.id, { status: val }); setDetail({ ...t, status: val }); }}
                        style={{
                          flex: 1, padding: "12px 0", fontSize: 14, fontWeight: 600, borderRadius: "var(--radius-sm)",
                          border: active ? "none" : "1.5px solid var(--line-strong)",
                          background: active ? "var(--brand)" : "var(--surface)",
                          color: active ? "#fff" : "var(--muted)",
                        }}>{label}</button>
                    );
                  })}
                </div>
              </div>

              <button onClick={() => setDetail(null)} className="btn-text" style={{ width: "100%", marginTop: 18 }}>Tutup</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
