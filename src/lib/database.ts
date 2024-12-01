import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

let db: Database.Database | null = null;

export const getDb = () => {
  if (!db) {
    // 데이터베이스 디렉토리 및 파일 경로 설정
    const dataDir = join(process.cwd(), 'data');
    const dbPath = join(dataDir, 'signup.db');

    // data 디렉토리가 없으면 생성
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    // 데이터베이스 연결
    db = new Database(dbPath);
  }
  return db;
};
