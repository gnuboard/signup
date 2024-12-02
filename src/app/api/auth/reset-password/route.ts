import { NextResponse } from 'next/server'
import { getUserByEmail, createPasswordResetToken } from '@/lib/db'
import nodemailer from 'nodemailer'
import { randomBytes } from 'crypto'

// 이메일 전송을 위한 transporter 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // 사용자 확인
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: '해당 이메일로 가입된 계정을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 소셜 로그인 사용자 체크
    if (user.provider && user.provider !== 'credentials') {
      return NextResponse.json(
        { 
          error: `이 계정은 ${user.provider} 계정으로 가입되었습니다. ${user.provider} 계정으로 로그인해주세요.` 
        },
        { status: 400 }
      )
    }

    // 비밀번호 재설정 토큰 생성
    const resetToken = randomBytes(32).toString('hex')
    await createPasswordResetToken(user.id, resetToken)

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`

    // 이메일 전송
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '비밀번호 재설정',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #2563eb; text-align: center;">비밀번호 재설정</h1>
          <p style="margin: 20px 0;">안녕하세요,</p>
          <p>비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 새로운 비밀번호를 설정하세요:</p>
          <p style="margin: 30px 0; word-break: break-all;">
            <a href="${resetUrl}" style="color: #2563eb; text-decoration: underline;">${resetUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px;">이 링크는 1시간 동안만 유효합니다.</p>
          <p style="color: #666; font-size: 14px;">비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.</p>
        </div>
      `,
    })

    return NextResponse.json({ message: '비밀번호 재설정 이메일을 전송했습니다.' })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: '비밀번호 재설정 이메일 전송에 실패했습니다.' },
      { status: 500 }
    )
  }
}
