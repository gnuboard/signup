import { NextResponse } from "next/server";
import { getUserByEmail, openDb, initializeDb } from "@/lib/db";
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // 필수 필드 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증
    if (password.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 데이터베이스 초기화
    await initializeDb();

    // 이메일 중복 검사
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "이미 가입된 이메일입니다." },
        { status: 400 }
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const db = await openDb();
    const result = await db.run(
      'INSERT INTO users (email, name, password, provider) VALUES (?, ?, ?, ?)',
      [email, name, hashedPassword, 'credentials']
    );

    console.log('회원가입 성공:', {
      userId: result.lastID,
      email,
      name,
      provider: 'credentials'
    });

    return NextResponse.json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.error('회원가입 에러:', error);
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}