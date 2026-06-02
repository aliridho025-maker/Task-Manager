"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export type Project = {
  id: string;
  name: string;
  client: string | null;
  value: number;
  paid: number;
  expense: number;
  payment_status: "belum" | "dp" | "lunas";
  note: string | null;
};

const STATUS_META: Record<Project["payment_status"], { label: string; bg: string; color: string }> = {
  belum: { label: "Belum bayar", bg: "var(--red-soft)", color: "var(--red)" },
  dp: { label: "DP", bg: "var(--amber-soft)", color: "var(--amber)" },
  lunas: { label: "Lunas", bg: "var(--green-soft)", color: "var(--green)" },
};

const rupiah = (n: number) =>
  "Rp " + Math.round(n).toLocaleString("id-ID");

export default function FinanceBoard({ initialProjects }: { initialProjects: Project[] }) {
  const supabase = createClient();
  const [items, setItems] = useState<Project[]>(initialProjects);
  useEffect(() => { setItems(initialProjects); }, [initialProjects]);
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [value, setValue] = useState("");
  const [paid, setPaid] = useState("");
  const [expense, setExpense] = useState("");
  const [status, setStatus] = useState<Project["payment_status"]>("belum");
  const [note, setNote] = useState("");

  function openNew() {
    setEditing(null);
    setName(""); setClient(""); setValue(""); setPaid(""); setExpense(""); setStatus("belum"); setNote("");
    setSheet(true);
  }
  function openEdit(p: Project) {
    setEditing(p);
    setName(p.name); setClient(p.client ?? ""); setValue(String(p.value));
    setPaid(String(p.paid)); setExpense(String(p.expense)); setStatus(p.payment_status); setNote(p.note ?? "");
    setSheet(true);
  }

  const num = (s: string) => {
    const n = parseFloat(s.replace(/[^\d.]/g, ""));
    return isNaN(n) ? 0 : n;
  };

  async function save() {
    if (!name.trim() || busy) return;
    setBusy(true);
    const payload = {
      name: name.trim(), client: client.trim() || null,
      value: num(value), paid: num(paid), expense: num(expense),
      payment_status: status, note: note.trim() || null,
    };
    if (editing) {
      const { error } = await supabase.from("projects").update(payload).eq("id", editing.id);
      setBusy(false);
      if (error) { alert("Gagal menyimpan: " + error.message); return; }
      setItems((p) => p.map((x) => (x.id === editing.id ? { ...x, ...payload } : x)));
    } else {
      const { data, error } = await supabase.from("projects").insert(payload).select().single();
      setBusy(false);
      if (error) { alert("Gagal menyimpan: " + error.message); return; }
      if (data) setItems((p) => [data as Project, ...p]);
    }
    setSheet(false);
  }

  async function del(id: string) {
    setItems((p) => p.filter((x) => x.id !== id));
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
  }

  const totals = useMemo(() => {
    const value = items.reduce((s, p) => s + Number(p.value), 0);
    const paid = items.reduce((s, p) => s + Number(p.paid), 0);
    const expense = items.reduce((s, p) => s + Number(p.expense), 0);
    return { value, paid, expense, outstanding: value - paid, profit: paid - expense };
  }, [items]);

  return (
    <div style={{ paddingBottom: 120 }}>
      <div className="pad" style={{ paddingTop: 8 }}>
        {/* Ringkasan utama: profit bersih */}
        <div style={{ background: "var(--brand)", borderRadius: "var(--radius)", padding: "18px 20px", color: "#fff", marginBottom: 12 }}>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Profit bersih (diterima − pengeluaran)</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 2, letterSpacing: "-0.5px" }}>{rupiah(totals.profit)}</div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
          <div style={{ flex: 1, background: "var(--surface-2)", borderRadius: "var(--radius)", padding: "12px 14px", WebkitBackdropFilter: "blur(14px)", backdropFilter: "blur(14px)" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Sudah diterima</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--green)", marginTop: 2 }}>{rupiah(totals.paid)}</div>
          </div>
          <div style={{ flex: 1, background: "var(--surface-2)", borderRadius: "var(--radius)", padding: "12px 14px", WebkitBackdropFilter: "blur(14px)", backdropFilter: "blur(14px)" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Sisa tagihan</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--amber)", marginTop: 2 }}>{rupiah(totals.outstanding)}</div>
          </div>
        </div>
        <div style={{ background: "var(--surface-2)", borderRadius: "var(--radius)", padding: "12px 14px", WebkitBackdropFilter: "blur(14px)", backdropFilter: "blur(14px)" }}>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Total pengeluaran</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--red)", marginTop: 2 }}>{rupiah(totals.expense)}</div>
        </div>
      </div>

      <div className="pad" style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--faint)", padding: "60px 20px", fontSize: 15 }}>
            Belum ada proyek.<br />Ketuk + untuk menambah pemasukan.
          </div>
        ) : (
          items.map((p) => {
            const sm = STATUS_META[p.payment_status];
            const profit = Number(p.paid) - Number(p.expense);
            return (
              <div key={p.id} onClick={() => openEdit(p)}
                style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: 15, boxShadow: "var(--shadow)", WebkitBackdropFilter: "blur(20px) saturate(180%)", backdropFilter: "blur(20px) saturate(180%)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    {p.client && <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 1 }}>{p.client}</div>}
                  </div>
                  <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, background: sm.bg, color: sm.color }}>{sm.label}</span>
                </div>

                <div style={{ display: "flex", gap: 14, marginTop: 13, fontSize: 13 }}>
                  <div>
                    <div style={{ color: "var(--faint)", fontSize: 11 }}>Nilai</div>
                    <div style={{ fontWeight: 600, marginTop: 1 }}>{rupiah(Number(p.value))}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--faint)", fontSize: 11 }}>Diterima</div>
                    <div style={{ fontWeight: 600, color: "var(--green)", marginTop: 1 }}>{rupiah(Number(p.paid))}</div>
                  </div>
                  {Number(p.expense) > 0 && (
                    <div>
                      <div style={{ color: "var(--faint)", fontSize: 11 }}>Biaya</div>
                      <div style={{ fontWeight: 600, color: "var(--red)", marginTop: 1 }}>{rupiah(Number(p.expense))}</div>
                    </div>
                  )}
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ color: "var(--faint)", fontSize: 11 }}>Profit</div>
                    <div style={{ fontWeight: 700, color: profit >= 0 ? "var(--brand)" : "var(--red)", marginTop: 1 }}>{rupiah(profit)}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button onClick={openNew}
        style={{ position: "fixed", bottom: 90, right: "max(18px, calc(50% - 280px + 18px))", width: 58, height: 58, borderRadius: 18, background: "var(--brand)", boxShadow: "0 6px 20px rgba(51,72,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      {sheet && (
        <div onClick={() => setSheet(false)} className="sheet-backdrop"
          style={{ position: "fixed", inset: 0, background: "rgba(20,20,26,0.4)", zIndex: 40, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} className="sheet-panel"
            style={{ width: "100%", maxWidth: 560, background: "var(--surface)", borderRadius: "22px 22px 0 0", padding: "10px 18px 28px", maxHeight: "90dvh", overflowY: "auto", boxShadow: "var(--shadow-lg)" }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, background: "var(--line-strong)", margin: "0 auto 18px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 19, fontWeight: 700 }}>{editing ? "Edit proyek" : "Proyek baru"}</h2>
              {editing && <button onClick={() => { del(editing.id); setSheet(false); }} style={{ background: "var(--red-soft)", color: "var(--red)", fontSize: 13, padding: "7px 12px" }}>Hapus</button>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <input autoFocus placeholder="Nama proyek (mis. Jasa Iklan Meta)" value={name} onChange={(e) => setName(e.target.value)} />
              <input placeholder="Klien (opsional)" value={client} onChange={(e) => setClient(e.target.value)} />
              <div>
                <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, display: "block", marginBottom: 5 }}>Nilai deal (total)</label>
                <input inputMode="numeric" placeholder="0" value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, display: "block", marginBottom: 5 }}>Sudah diterima</label>
                  <input inputMode="numeric" placeholder="0" value={paid} onChange={(e) => setPaid(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, display: "block", marginBottom: 5 }}>Pengeluaran</label>
                  <input inputMode="numeric" placeholder="0" value={expense} onChange={(e) => setExpense(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, display: "block", marginBottom: 5 }}>Status pembayaran</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as Project["payment_status"])}>
                  <option value="belum">Belum bayar</option>
                  <option value="dp">DP</option>
                  <option value="lunas">Lunas</option>
                </select>
              </div>
              <textarea placeholder="Catatan (opsional)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} style={{ resize: "none" }} />
              <button className="btn-brand" onClick={save} disabled={busy} style={{ marginTop: 4 }}>
                {busy ? "Menyimpan..." : editing ? "Simpan perubahan" : "Tambah proyek"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
