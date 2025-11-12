## Sistem Keluar-Masuk Barang

Aplikasi ini adalah dashboard sederhana untuk mengelola stok barang, mencatat barang masuk/keluar, dan menampilkan nilai persediaan secara realtime menggunakan Next.js (App Router) dan SQLite.

### Fitur Utama

- CRUD master barang (kode, nama, harga jual, stok).
- Pencatatan mutasi barang masuk/keluar dengan catatan tambahan.
- Ringkasan stok (jumlah SKU, stok total, nilai persediaan, stok menipis).
- Riwayat mutasi terbaru serta penandaan stok rendah (&le; 5 unit).

### Prasyarat

- Node.js 18 atau lebih baru.
- SQLite sudah termasuk dalam dependensi `better-sqlite3`.

### Konfigurasi Database

Secara bawaan aplikasi akan membuat database lokal pada `database/app.db`. Anda dapat menyesuaikan lokasi dan nama file melalui variabel lingkungan berikut (opsional):

```
DATABASE_DIR=database
DATABASE_FILE=app.db
```

Tambahkan variabel di `.env` bila perlu sebelum menjalankan aplikasi.

### Instalasi dan Inisialisasi

```bash
npm install
npm run lint   # opsional, memastikan kode bersih
node setup.js  # membuat folder database & tabel bila belum ada
npm run dev    # jalankan aplikasi pada mode pengembangan
```

Setelah server berjalan, buka [http://localhost:3000](http://localhost:3000) untuk menggunakan dashboard.

### Struktur Komponen

- `components/inventory/inventory-dashboard.jsx` – UI utama untuk ringkasan stok, form barang baru, dan form mutasi.
- `app/api/items` – endpoint untuk mengambil, membuat, memperbarui, dan menghapus master barang.
- `app/api/transactions` – endpoint untuk membuat dan mengambil riwayat mutasi barang.

### Testing Manual yang Disarankan

1. Tambah barang baru dengan stok awal dan periksa daftar serta ringkasan.
2. Catat barang masuk, pastikan stok bertambah dan mutasi muncul.
3. Catat barang keluar dengan jumlah lebih besar dari stok untuk memastikan validasi.
4. Refresh halaman; data harus tetap konsisten karena tersimpan di SQLite.

### Deploy

Siapkan database SQLite di server/hosting Anda dan pastikan variabel lingkungan `DATABASE_DIR` dan `DATABASE_FILE` mengarah ke lokasi yang benar sebelum menjalankan `npm run build` dan `npm run start`.
