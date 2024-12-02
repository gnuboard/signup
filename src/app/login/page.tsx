'use client'

import { signIn } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { emailSchema, passwordSchema, validateForm } from '@/lib/validations'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string[], password?: string[] }>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('로그인 에러:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 폼 유효성 검사
    const loginData = { email, password }
    const emailValidation = validateForm(emailSchema, email)
    const passwordValidation = validateForm(passwordSchema, password)
    
    // 기본 필수 입력 검사
    const newErrors: { email?: string[], password?: string[] } = {}
    
    if (!email) {
      newErrors.email = ['이메일을 입력해주세요.']
    } else if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errors.email || ['올바른 이메일 주소를 입력해주세요.']
    }
    
    if (!password) {
      newErrors.password = ['비밀번호를 입력해주세요.']
    } else if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors.password || [
        '비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.'
      ]
    }
    
    setErrors(newErrors)
    
    // 유효성 검사 에러가 있으면 제출하지 않음
    if (Object.keys(newErrors).length > 0) {
      return
    }

    try {
      setIsLoading(true)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/'
      })

      if (!result?.ok) {
        // 서버 인증 실패 시 각각의 필드에 대한 에러 메시지 설정
        if (result?.error === 'InvalidEmail') {
          setErrors({
            email: ['등록되지 않은 이메일입니다.']
          })
        } else if (result?.error === 'InvalidPassword') {
          setErrors({
            password: ['비밀번호가 올바르지 않습니다.']
          })
        } else if (result?.error === 'SocialLoginUser') {
          setErrors({
            email: ['소셜 로그인으로 가입된 계정입니다. 소셜 로그인을 이용해주세요.']
          })
        } else {
          setErrors({
            email: ['로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.']
          })
        }
        return
      }

      if (result.url) {
        router.push(result.url)
        router.refresh()
      }
    } catch (error) {
      console.error('로그인 에러:', error)
      setErrors({
        email: ['로그인 중 오류가 발생했습니다.']
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              type="text"
              id="email"
              name="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="your@email.com"
            />
            {errors.email?.map((error, index) => (
              <p key={index} className="mt-1 text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="••••••••"
            />
            {errors.password?.map((error, index) => (
              <p key={index} className="mt-1 text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="text-center space-y-2">
          <button
            onClick={() => router.push('/reset-password')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            비밀번호를 잊으셨나요?
          </button>
          <div>
            <span className="text-sm text-gray-600">계정이 없으신가요?{' '}</span>
            <button
              onClick={() => router.push('/signup')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              회원가입
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <FcGoogle className="w-5 h-5" />
            <span>Google로 계속하기</span>
          </button>
        </div>
      </div>
    </div>
  )
}
