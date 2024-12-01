'use server';

import { initDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    initDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
