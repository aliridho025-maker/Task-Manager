# Manajer Tugas

Task manager pribadi: Next.js (App Router) + Supabase Auth + Postgres, deploy di Vercel.

Fitur: tambah/edit status/hapus tugas, deadline, prioritas (tinggi/sedang/rendah), kategori, status (belum/proses/selesai), filter, tanda telat, login per pengguna dengan data terisolasi (RLS).

---

## Langkah setup (urutkan persis)

### 1. Buat project Supabase
1. Buka https://supabase.com → New project. Catat **database password**.
2. Setelah jadi, masuk **SQL Editor → New query**, tempel isi `supabase_schema.sql`, klik **Run**.
3. Masuk **Project Settings → API**. Salin:
   - `Project URL` → ini `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) ATAU `anon` key lama → ini `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     (Keduanya bekerja. Key lama masih valid sampai akhir 2026; gunakan publishable bila ada.)
4. **Authentication → Providers → Email**: pastikan aktif.
   - Untuk pengembangan lebih cepat, di **Authentication → Sign In / Providers → Email**, Anda bisa
     nonaktifkan "Confirm email" agar tidak perlu klik link konfirmasi tiap daftar. (Aktifkan lagi untuk produksi.)

### 2. Jalankan lokal (opsional, untuk tes)
```bash
npm install
cp .env.local.example .env.local   # lalu isi nilainya
npm run dev
```
Buka http://localhost:3000

### 3. Push ke GitHub
```bash
git init
git add .
git commit -m "Manajer tugas awal"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

### 4. Deploy di Vercel
1. https://vercel.com → Add New → Project → import repo GitHub Anda.
2. Di **Environment Variables**, tambahkan dua yang sama:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy. Catat URL produksi (mis. `https://nama-anda.vercel.app`).

### 5. Sambungkan URL produksi ke Supabase (PENTING untuk login)
Di Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://nama-anda.vercel.app`
- **Redirect URLs**: tambahkan `https://nama-anda.vercel.app/auth/callback`

Tanpa langkah ini, konfirmasi email akan gagal redirect.

---

## Catatan penting / keterbatasan

- **RLS wajib aktif.** Sudah diatur di `supabase_schema.sql`. Anon key memang ter-expose di browser — itu normal; keamanan datang dari RLS, bukan dari menyembunyikan key.
- **Free tier Supabase**: project bisa di-pause otomatis setelah ~1 minggu tanpa aktivitas. Resume manual di dashboard. (Verifikasi kebijakan terkini di dashboard Anda.)
- **Belum ada**: notifikasi/pengingat, edit judul tugas (hanya status & hapus), realtime sync antar-tab. Bisa ditambahkan bila perlu.
- Versi paket di `package.json` adalah patokan; jalankan `npm install` untuk versi minor terbaru yang kompatibel.
