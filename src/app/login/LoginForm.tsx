"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LoginForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !password) { setMsg("Email dan kata sandi wajib diisi."); return; }
    setLoading(true); setMsg("");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      setMsg(error ? error.message : "Cek email untuk konfirmasi, lalu masuk.");
      if (!error) setMode("signin");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else location.href = "/";
    }
    setLoading(false);
  }

  return (
    <div className="shell pad" style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 0, paddingBottom: 40 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--brand)", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" }}>Manajer Tugas</h1>
      <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 6, marginBottom: 28 }}>
        {mode === "signin" ? "Masuk untuk melihat jadwal Anda" : "Buat akun untuk mulai"}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="email" inputMode="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Kata sandi" value={password}
          onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
        <button className="btn-brand" onClick={handleSubmit} disabled={loading}>
          {loading ? "Memproses..." : mode === "signin" ? "Masuk" : "Daftar"}
        </button>
      </div>

      {msg && <p style={{ marginTop: 16, fontSize: 14, color: "var(--amber)" }}>{msg}</p>}

      <p style={{ marginTop: 24, fontSize: 14, color: "var(--muted)", textAlign: "center" }}>
        {mode === "signin" ? "Belum punya akun? " : "Sudah punya akun? "}
        <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMsg(""); }}
          style={{ background: "none", color: "var(--brand)", fontWeight: 600, padding: 0 }}>
          {mode === "signin" ? "Daftar" : "Masuk"}
        </button>
      </p>
    </div>
  );
}
