'use server';

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// 데이터베이스 연결
export async function openDb() {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
}

// 데이터베이스 초기화 및 테이블 생성
export async function initializeDb() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      social_id TEXT UNIQUE,
      name TEXT,
      email TEXT UNIQUE,
      image TEXT,
      provider TEXT,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

// 이메일로 사용자 조회
export async function getUserByEmail(email: string) {
  const db = await openDb();
  return db.get('SELECT * FROM users WHERE email = ?', [email]);
}

// 사용자 ID로 조회
export async function getUserById(id: number) {
  const db = await openDb();
  return db.get('SELECT * FROM users WHERE id = ?', [id]);
}

// 새 사용자 생성
export interface UserData {
  social_id?: string;
  email: string;
  name: string;
  image?: string;
  provider: string;
  password?: string;
}

export async function createUser(userData: UserData) {
  const db = await openDb();
  const result = await db.run(
    'INSERT INTO users (social_id, email, name, image, provider, password) VALUES (?, ?, ?, ?, ?, ?)',
    [userData.social_id, userData.email, userData.name, userData.image, userData.provider, userData.password]
  );
  return result.lastID;
}

// 사용자 정보 업데이트
export async function updateUser(email: string, userData: Partial<UserData>) {
  const db = await openDb();
  const updates: string[] = [];
  const values: any[] = [];

  Object.entries(userData).forEach(([key, value]) => {
    if (value !== undefined) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (updates.length === 0) return;

  values.push(email);
  const query = `UPDATE users SET ${updates.join(', ')} WHERE email = ?`;
  return db.run(query, values);
}

// 사용자 삭제
export async function deleteUser(email: string) {
  const db = await openDb();
  return db.run('DELETE FROM users WHERE email = ?', [email]);
}

// 비밀번호 재설정 토큰 생성
export async function createPasswordResetToken(userId: number, token: string) {
  const db = await openDb();
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // 1시간 후 만료

  await db.run(
    'INSERT INTO password_reset_tokens (user_id, token, expires) VALUES (?, ?, ?)',
    [userId, token, expires.toISOString()]
  );
}

// 비밀번호 재설정 토큰 검증
export async function verifyPasswordResetToken(token: string) {
  const db = await openDb();
  const result = await db.get(
    'SELECT * FROM password_reset_tokens WHERE token = ? AND expires > datetime("now")',
    [token]
  );
  
  if (result) {
    // 사용된 토큰 삭제
    await db.run('DELETE FROM password_reset_tokens WHERE token = ?', [token]);
  }
  
  return result;
}
