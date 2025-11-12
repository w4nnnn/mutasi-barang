import { NextResponse } from 'next/server';
import conn from '@/lib/conn';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get('limit') ?? 20);
    const limit = Number.isInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20;

    const data = conn.all(
      `SELECT m.id_mutasi AS id,
              m.id_barang AS itemId,
              sb.kode_barang AS itemCode,
              sb.nama_barang AS itemName,
              m.tipe AS type,
              m.jumlah AS quantity,
              COALESCE(m.keterangan, '') AS note,
              m.created_at AS createdAt
       FROM mutasi_barang m
       JOIN stok_barang sb ON sb.id_barang = m.id_barang
       ORDER BY m.created_at DESC, m.id_mutasi DESC
       LIMIT ?`,
      [limit]
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[GET /api/transactions] Failed:', error);
    return NextResponse.json({ error: 'Gagal mengambil data mutasi.' }, { status: 500 });
  }
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Format JSON tidak valid.' }, { status: 400 });
  }

  const itemId = Number(payload?.itemId);
  const type = payload?.type === 'masuk' || payload?.type === 'keluar' ? payload.type : null;
  const quantity = Number(payload?.quantity);
  const note = payload?.note ? String(payload.note).trim() : null;

  if (!Number.isInteger(itemId) || itemId <= 0) {
    return NextResponse.json({ error: 'ID barang tidak valid.' }, { status: 400 });
  }

  if (!type) {
    return NextResponse.json({ error: 'Tipe mutasi harus "masuk" atau "keluar".' }, { status: 400 });
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return NextResponse.json({ error: 'Jumlah harus berupa bilangan bulat positif.' }, { status: 400 });
  }

  try {
    const item = conn.get(
      `SELECT id_barang AS id, stok_akhir AS stock
       FROM stok_barang
       WHERE id_barang = ?`
      , [itemId]
    );

    if (!item) {
      return NextResponse.json({ error: 'Barang tidak ditemukan.' }, { status: 404 });
    }

    if (type === 'keluar' && item.stock < quantity) {
      return NextResponse.json({ error: 'Stok tidak mencukupi untuk pengeluaran.' }, { status: 409 });
    }

    const nextStock = type === 'masuk' ? item.stock + quantity : item.stock - quantity;

    const runTransaction = conn.db.transaction(() => {
      conn.run(
        'UPDATE stok_barang SET stok_akhir = ? WHERE id_barang = ?',
        [nextStock, itemId]
      );

      conn.run(
        `INSERT INTO mutasi_barang (id_barang, tipe, jumlah, keterangan)
         VALUES (?, ?, ?, ?)`
        , [itemId, type, quantity, note]
      );
    });

    runTransaction();

    const createdMutation = conn.get(
      `SELECT m.id_mutasi AS id,
              m.id_barang AS itemId,
              sb.kode_barang AS itemCode,
              sb.nama_barang AS itemName,
              m.tipe AS type,
              m.jumlah AS quantity,
              COALESCE(m.keterangan, '') AS note,
              m.created_at AS createdAt
       FROM mutasi_barang m
       JOIN stok_barang sb ON sb.id_barang = m.id_barang
       WHERE m.rowid = last_insert_rowid()`
    );

    const updatedItem = conn.get(
      `SELECT id_barang AS id, kode_barang AS code, nama_barang AS name, stok_akhir AS stock
       FROM stok_barang
       WHERE id_barang = ?`
      , [itemId]
    );

    return NextResponse.json({ data: { mutation: createdMutation, item: updatedItem } }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/transactions] Failed:', error);
    return NextResponse.json({ error: 'Gagal menyimpan mutasi barang.' }, { status: 500 });
  }
}
