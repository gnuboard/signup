import { NextResponse } from "next/server"
import { z } from "zod"

// 회원가입 데이터 검증 스키마
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = signUpSchema.parse(body)

    // TODO: 실제 데이터베이스 연동
    // 여기서는 임시로 성공 응답만 반환
    
    return NextResponse.json(
      { message: "회원가입이 완료되었습니다." },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "입력 데이터가 올바르지 않습니다.", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 