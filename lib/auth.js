import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import conn from '@/lib/conn';

export const SESSION_COOKIE_NAME = 'session_token';
const DEFAULT_SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS ?? 7);
const SESSION_TTL_MS = DEFAULT_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

const COOKIE_SECURE = (() => {
  const flag = process.env.COOKIE_SECURE?.toLowerCase();
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return process.env.NODE_ENV === 'production';
})();

function now() {
  return new Date();
}

function createExpiryDate() {
  return new Date(now().getTime() + SESSION_TTL_MS);
}

function normalizeUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id_user,
    username: row.username,
    fullName: row.nama_lengkap,
    role: row.role,
  };
}

export function verifyPassword(plain, hash) {
  try {
    return bcrypt.compareSync(plain, hash);
  } catch (error) {
    console.error('[auth] Failed to verify password:', error);
    return false;
  }
}

export function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = createExpiryDate();

  const transaction = conn.db.transaction(() => {
    conn.run('DELETE FROM sessions WHERE user_id = ?', [userId]);
    conn.run(
      `INSERT INTO sessions (user_id, token, expires_at)
       VALUES (?, ?, ?)`
      , [userId, token, expiresAt.toISOString()]
    );
  });

  transaction();

  return {
    token,
    expiresAt,
  };
}

export function deleteSession(token) {
  if (!token) {
    return;
  }
  try {
    conn.run('DELETE FROM sessions WHERE token = ?', [token]);
  } catch (error) {
    console.error('[auth] Failed to delete session:', error);
  }
}

function getSessionWithUser(token) {
  if (!token) {
    return null;
  }

  const session = conn.get(
    `SELECT s.token,
            s.expires_at AS expiresAt,
            u.id_user,
            u.username,
            u.nama_lengkap,
            u.role
     FROM sessions s
     JOIN users u ON u.id_user = s.user_id
     WHERE s.token = ?`
    , [token]
  );

  if (!session) {
    return null;
  }

  if (session.expiresAt && new Date(session.expiresAt) < now()) {
    deleteSession(token);
    return null;
  }

  return session;
}

export function getUserByToken(token) {
  const session = getSessionWithUser(token);
  if (!session) {
    return null;
  }
  return normalizeUser(session);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    return null;
  }
  return getUserByToken(sessionCookie.value);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export function setSessionCookie(response, token, expiresAt) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
