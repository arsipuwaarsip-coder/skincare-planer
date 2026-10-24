# Skincare Planner

Aplikasi pelacak skincare pribadi (React + Tailwind, build dengan Vite). Tanpa backend, tanpa login. Data disimpan di localStorage.

## Jalankan lokal
    npm install
    npm run dev        # pengembangan
    npm run build      # hasil di folder dist/

## Deploy ke Vercel
1. Push proyek ini ke GitHub/GitLab.
2. Di vercel.com: Add New > Project > pilih repo. Framework terdeteksi Vite; Build Command `npm run build`, Output Directory `dist`.
3. Deploy. Alternatif tanpa Git: `npx vercel` di folder proyek.

## Deploy ke Cloudflare Pages
1. Push ke GitHub/GitLab, lalu Workers & Pages > Create > Pages > Connect to Git.
2. Build command `npm run build`, build output directory `dist`.
3. Jika build gagal karena versi Node, tambahkan variabel lingkungan `NODE_VERSION` = `20`.
4. Alternatif tanpa Git: `npm run build && npx wrangler pages deploy dist --project-name skincare-planner`.

## Catatan data (penting)
- localStorage terikat pada **browser + perangkat + alamat situs**. Data di HP dan laptop **tidak otomatis sinkron**.
- Mengganti domain (mis. dari alamat preview ke domain final) berarti memakai penyimpanan baru yang kosong. Cadangkan dulu.
- Pindah data antar perangkat: Setelan > Salin data (JSON) di perangkat lama, lalu tempel di Setelan > Impor dari teks di perangkat baru.
- Membersihkan data browser menghapus data aplikasi. Simpan cadangan JSON secara berkala.
- Versi ini ditulis dalam JavaScript (bukan TypeScript) dan memakai emoji sebagai ikon.
