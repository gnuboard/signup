'use server';

import { getDb } from './database';

export const initDb = async () => {
  try {
    console.log('Initializing database...');
    const db = getDb();
    
    // 회원 테이블 생성
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    db.exec(createUsersTable);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// 사용자 관련 쿼리 함수들
export const createUser = async (email: string, password: string, name: string) => {
  const db = getDb();
  const stmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
  return stmt.run(email, password, name);
};

export const getUserByEmail = async (email: string) => {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
};

export const updateUser = async (email: string, data: { name?: string; password?: string }) => {
  const db = getDb();
  const updates: string[] = [];
  const values: any[] = [];

  if (data.name) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.password) {
    updates.push('password = ?');
    values.push(data.password);
  }
  updates.push('updated_at = CURRENT_TIMESTAMP');

  if (updates.length === 0) return null;

  const query = `UPDATE users SET ${updates.join(', ')} WHERE email = ?`;
  values.push(email);

  const stmt = db.prepare(query);
  return stmt.run(...values);
};

export const deleteUser = async (email: string) => {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM users WHERE email = ?');
  return stmt.run(email);
};
