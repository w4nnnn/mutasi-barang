import { NextResponse } from 'next/server';
import conn from '@/lib/conn';

export async function GET() {
  try {
    const items = conn.all(
      `SELECT id_barang AS id, kode_barang AS code, nama_barang AS name, stok_akhir AS stock
       FROM stok_barang
       ORDER BY nama_barang ASC`
    );

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error('[GET /api/items] Failed:', error);
    return NextResponse.json({ error: 'Gagal mengambil data barang.' }, { status: 500 });
  }
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Format JSON tidak valid.' }, { status: 400 });
  }

  const kodeBarang = payload?.kodeBarang?.trim();
  const namaBarang = payload?.namaBarang?.trim();
  const initialStockRaw = payload?.initialStock ?? 0;
  const initialStock = Number.isNaN(Number(initialStockRaw)) ? 0 : Number(initialStockRaw);

  if (!kodeBarang) {
    return NextResponse.json({ error: 'Kode barang wajib diisi.' }, { status: 400 });
  }

  if (!namaBarang) {
    return NextResponse.json({ error: 'Nama barang wajib diisi.' }, { status: 400 });
  }

  if (!Number.isInteger(initialStock) || initialStock < 0) {
    return NextResponse.json({ error: 'Stok awal harus berupa bilangan bulat positif atau nol.' }, { status: 400 });
  }

  try {
    const insertResult = conn.run(
      `INSERT INTO stok_barang (kode_barang, nama_barang, stok_akhir)
       VALUES (?, ?, ?)`
      , [kodeBarang, namaBarang, initialStock]
    );

    const createdId = Number(insertResult.lastInsertRowid);

    if (initialStock > 0) {
      conn.run(
        `INSERT INTO mutasi_barang (id_barang, tipe, jumlah, keterangan)
         VALUES (?, 'masuk', ?, ?)`
        , [createdId, initialStock, 'Stok awal']
      );
    }

    const createdItem = conn.get(
      `SELECT id_barang AS id, kode_barang AS code, nama_barang AS name, stok_akhir AS stock
       FROM stok_barang
       WHERE id_barang = ?`
      , [createdId]
    );

    return NextResponse.json({ data: createdItem }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/items] Failed:', error);

    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Kode barang sudah digunakan.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Gagal menyimpan barang baru.' }, { status: 500 });
  }
}
