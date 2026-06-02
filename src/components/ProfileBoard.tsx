"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export type Profile = {
  id: string;
  full_name: string | null;
  wa: string | null;
  division: string | null;
};

function initials(name: string, email: string) {
  const src = name.trim() || email;
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

export default function ProfileBoard({
  initialProfile, userId, userEmail,
}: { initialProfile: Profile | null; userId: string; userEmail: string }) {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile>(
    initialProfile ?? { id: userId, full_name: null, wa: null, division: null }
  );
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState(profile.full_name ?? "");
  const [wa, setWa] = useState(profile.wa ?? "");
  const [division, setDivision] = useState(profile.division ?? "");

  async function save() {
    if (busy) return;
    setBusy(true);
    const payload = {
      id: userId,
      full_name: name.trim() || null,
      wa: wa.trim() || null,
      division: division.trim() || null,
    };
    const { error } = await supabase.from("profiles").upsert(payload);
    setBusy(false);
    if (error) { alert("Gagal menyimpan: " + error.message); return; }
    setProfile(payload);
    setEditing(false);
  }

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
      <span style={{ fontSize: 14, color: "var(--muted)" }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 500, color: value === "—" ? "var(--faint)" : "var(--text)" }}>{value}</span>
    </div>
  );

  return (
    <div className="pad" style={{ paddingTop: 8, paddingBottom: 100 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0 24px" }}>
        <div style={{ width: 84, height: 84, borderRadius: "50%", background: "var(--brand)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700 }}>
          {initials(profile.full_name ?? "", userEmail)}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 14 }}>{profile.full_name || "Belum ada nama"}</div>
        {profile.division && <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 2 }}>{profile.division}</div>}
      </div>

      {!editing ? (
        <>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "2px 16px", boxShadow: "var(--shadow)" }}>
            <Row label="Nama" value={profile.full_name || "—"} />
            <Row label="No. WhatsApp" value={profile.wa || "—"} />
            <Row label="Email" value={userEmail} />
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0" }}>
              <span style={{ fontSize: 14, color: "var(--muted)" }}>Divisi</span>
              <span style={{ fontSize: 15, fontWeight: 500, color: profile.division ? "var(--text)" : "var(--faint)" }}>{profile.division || "—"}</span>
            </div>
          </div>

          <button className="btn-brand" onClick={() => { setName(profile.full_name ?? ""); setWa(profile.wa ?? ""); setDivision(profile.division ?? ""); setEditing(true); }} style={{ marginTop: 16 }}>
            Edit profil
          </button>
          <form action="/auth/signout" method="post" style={{ marginTop: 10 }}>
            <button type="submit" className="btn-text" style={{ width: "100%", color: "var(--red)" }}>Keluar</button>
          </form>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <div>
            <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, display: "block", marginBottom: 5 }}>Nama lengkap</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, display: "block", marginBottom: 5 }}>No. WhatsApp</label>
            <input inputMode="tel" value={wa} onChange={(e) => setWa(e.target.value)} placeholder="08xxxxxxxxxx" />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, display: "block", marginBottom: 5 }}>Email</label>
            <input value={userEmail} disabled style={{ opacity: 0.6 }} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, display: "block", marginBottom: 5 }}>Divisi</label>
            <input value={division} onChange={(e) => setDivision(e.target.value)} placeholder="mis. Marketing" />
          </div>
          <button className="btn-brand" onClick={save} disabled={busy} style={{ marginTop: 4 }}>
            {busy ? "Menyimpan..." : "Simpan"}
          </button>
          <button className="btn-text" onClick={() => setEditing(false)} style={{ width: "100%" }}>Batal</button>
        </div>
      )}
    </div>
  );
}
