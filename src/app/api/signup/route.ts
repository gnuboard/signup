import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 비밀번호 해시화 (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: 여기에 데이터베이스 저장 로직 추가
    
    return NextResponse.json({ 
      message: '회원가입이 완료되었습니다.',
      user: {
        email,
        // 해시된 비밀번호는 응답에 포함하지 않음
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
