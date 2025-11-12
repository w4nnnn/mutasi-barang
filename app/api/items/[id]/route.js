import { NextResponse } from 'next/server';
import conn from '@/lib/conn';

function parseId(paramId) {
  const id = Number(paramId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export async function GET(_request, { params }) {
  const id = parseId(params?.id);
  if (!id) {
    return NextResponse.json({ error: 'ID barang tidak valid.' }, { status: 400 });
  }

  try {
    const item = conn.get(
      `SELECT id_barang AS id, kode_barang AS code, nama_barang AS name, stok_akhir AS stock
       FROM stok_barang
       WHERE id_barang = ?`
      , [id]
    );

    if (!item) {
      return NextResponse.json({ error: 'Barang tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error(`[GET /api/items/${id}] Failed:`, error);
    return NextResponse.json({ error: 'Gagal mengambil data barang.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const id = parseId(params?.id);
  if (!id) {
    return NextResponse.json({ error: 'ID barang tidak valid.' }, { status: 400 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Format JSON tidak valid.' }, { status: 400 });
  }

  const kodeBarang = payload?.kodeBarang?.trim();
  const namaBarang = payload?.namaBarang?.trim();
  if (!kodeBarang && !namaBarang) {
    return NextResponse.json({ error: 'Tidak ada perubahan yang dikirim.' }, { status: 400 });
  }

  try {
    const item = conn.get('SELECT id_barang FROM stok_barang WHERE id_barang = ?', [id]);
    if (!item) {
      return NextResponse.json({ error: 'Barang tidak ditemukan.' }, { status: 404 });
    }

    const updates = [];
    const paramsToBind = [];

    if (kodeBarang) {
      updates.push('kode_barang = ?');
      paramsToBind.push(kodeBarang);
    }

    if (namaBarang) {
      updates.push('nama_barang = ?');
      paramsToBind.push(namaBarang);
    }

    paramsToBind.push(id);

    conn.run(
      `UPDATE stok_barang
       SET ${updates.join(', ')}
       WHERE id_barang = ?`
      , paramsToBind
    );

    const updatedItem = conn.get(
      `SELECT id_barang AS id, kode_barang AS code, nama_barang AS name, stok_akhir AS stock
       FROM stok_barang
       WHERE id_barang = ?`
      , [id]
    );

    return NextResponse.json({ data: updatedItem });
  } catch (error) {
    console.error(`[PUT /api/items/${id}] Failed:`, error);

    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Kode barang sudah digunakan.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Gagal memperbarui barang.' }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const id = parseId(params?.id);
  if (!id) {
    return NextResponse.json({ error: 'ID barang tidak valid.' }, { status: 400 });
  }

  try {
    const existing = conn.get('SELECT id_barang FROM stok_barang WHERE id_barang = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Barang tidak ditemukan.' }, { status: 404 });
    }

    const relatedMutation = conn.get(
      'SELECT 1 FROM mutasi_barang WHERE id_barang = ? LIMIT 1',
      [id]
    );

    if (relatedMutation) {
      return NextResponse.json({ error: 'Tidak dapat menghapus barang yang memiliki riwayat mutasi.' }, { status: 409 });
    }

    conn.run('DELETE FROM stok_barang WHERE id_barang = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE /api/items/${id}] Failed:`, error);
    return NextResponse.json({ error: 'Gagal menghapus barang.' }, { status: 500 });
  }
}
