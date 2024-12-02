import { NextResponse } from 'next/server'
import { openDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    // 토큰 유효성 검사
    const db = await openDb()
    const resetToken = await db.get(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND expires > datetime("now")',
      [token]
    )

    if (!resetToken) {
      return NextResponse.json(
        { error: '유효하지 않거나 만료된 토큰입니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10)

    // 비밀번호 업데이트
    await db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, resetToken.user_id]
    )

    // 사용된 토큰 삭제
    await db.run('DELETE FROM password_reset_tokens WHERE token = ?', [token])

    return NextResponse.json({ message: '비밀번호가 성공적으로 변경되었습니다.' })
  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json(
      { error: '비밀번호 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}
