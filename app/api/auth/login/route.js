import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import conn from '@/lib/conn';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Format JSON tidak valid.' }, { status: 400 });
  }

  const username = payload?.username?.trim();
  const password = payload?.password ?? '';

  if (!username || !password) {
    return NextResponse.json({ error: 'Username dan password wajib diisi.' }, { status: 400 });
  }

  try {
    const user = conn.get(
      `SELECT id_user, username, password, nama_lengkap, role
       FROM users
       WHERE username = ?`
      , [username]
    );

    if (!user) {
      return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 });
    }

    const { token, expiresAt } = createSession(user.id_user);
    const response = NextResponse.json({
      data: {
        id: user.id_user,
        username: user.username,
        fullName: user.nama_lengkap,
        role: user.role,
      },
    });

    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error) {
    console.error('[POST /api/auth/login] Failed:', error);
    return NextResponse.json({ error: 'Gagal memproses login.' }, { status: 500 });
  }
}
