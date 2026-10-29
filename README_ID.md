# Arianto AI Studio — Image Generator

Aplikasi HTML responsif untuk membuat gambar dari teks dan mengedit gambar unggahan menggunakan `gpt-image-2.5-sunburst`.

## Arsitektur

- `index.html`: UI di browser.
- `api/generate.js`: endpoint pembuatan gambar.
- `api/edit.js`: endpoint edit gambar.
- `api/_common.js`: validasi, pemeriksaan kode akses, dan panggilan API.
- Vercel menjalankan backend API. GitHub menyimpan kode dan GitHub Actions melakukan deployment.
- API key OpenAI tidak pernah dimasukkan ke HTML.

## 1. Persiapan di HP Android

1. Buka GitHub dan buat repository baru, misalnya `arianto-ai-image-generator`.
2. Unggah semua file/folder dalam ZIP ini ke root repository. Pastikan folder `api` dan `.github/workflows` ikut terunggah.
3. Buat akun/buka dashboard Vercel: https://vercel.com/ lalu impor repository GitHub tersebut. Framework preset dapat dipilih `Other`.
4. Deploy sekali dari Vercel agar proyek terdaftar.

Cara paling mudah: sambungkan repository GitHub ke Vercel lewat dashboard; Vercel dapat melakukan deployment otomatis saat ada push. Workflow GitHub Actions yang disertakan adalah alternatif untuk deployment berbasis Actions.

## 2. Tambahkan environment variables di Vercel

Buka proyek Vercel → Settings → Environment Variables. Tambahkan:

- `OPENAI_API_KEY` = API key OpenAI milikmu.
- `APP_ACCESS_CODE` = kode akses buatanmu sendiri, misalnya string acak panjang. Jangan gunakan API key sebagai kode akses.

Pilih environment Production (dan Preview jika dibutuhkan), lalu simpan dan lakukan redeploy. API key dibuat di https://platform.openai.com/api-keys. Pastikan API billing dan akses model aktif. ChatGPT Plus tidak otomatis mencakup biaya API.

## 3. Jika ingin deployment melalui GitHub Actions

Di Vercel, buka Settings/Account → Tokens dan buat token deployment. Temukan `VERCEL_ORG_ID` dan `VERCEL_PROJECT_ID` di pengaturan proyek atau file `.vercel/project.json` setelah menghubungkan proyek menggunakan Vercel CLI.

Di GitHub repository → Settings → Secrets and variables → Actions → New repository secret, buat:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Lalu buka tab Actions dan jalankan workflow `Deploy AI Image Generator to Vercel`, atau push perubahan ke branch `main`.

`OPENAI_API_KEY` dan `APP_ACCESS_CODE` harus tetap disimpan di Environment Variables Vercel, bukan di workflow atau file HTML.

## 4. Menggunakan aplikasi

1. Buka URL deployment Vercel.
2. Masukkan kode akses yang kamu set pada `APP_ACCESS_CODE`.
3. Pilih tab Buat gambar atau Edit gambar.
4. Tulis prompt. Untuk edit, pilih gambar terlebih dahulu.
5. Pilih ukuran dan kualitas, kemudian tekan tombol proses.
6. Tekan Unduh PNG untuk menyimpan hasil.

## Catatan keamanan dan biaya

- Jangan pernah menulis API key di `index.html`, JavaScript browser, atau repository.
- Kode akses hanya membatasi pemakaian dasar. Untuk aplikasi publik berskala besar, tambahkan login per pengguna, rate limit, kuota, dan pemantauan biaya.
- Endpoint mengembalikan gambar base64; gambar tidak disimpan permanen di server. Unduh hasilnya sebelum membersihkan halaman.
- Permintaan gambar dapat memerlukan waktu cukup lama dan dikenai biaya API. Periksa harga dan batas akun pada dokumentasi OpenAI.
- Jika muncul error akses model/organisasi, periksa verifikasi organisasi, billing, dan akses model di dashboard OpenAI.
- Jangan unggah gambar yang tidak kamu miliki haknya atau data pribadi sensitif.

Dokumentasi:
- https://developers.openai.com/api/docs/guides/image-generation
- https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst
- https://vercel.com/docs/functions
- https://docs.github.com/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions
