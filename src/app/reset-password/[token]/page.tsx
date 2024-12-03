'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { generatePassword } from '@/lib/constants'
import { passwordSchema } from '@/lib/validations'
import { z } from 'zod'

export default function ResetPasswordWithToken({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    password: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const validatePassword = (password: string) => {
    try {
      passwordSchema.parse(password)
      setValidationErrors([])
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors(error.errors.map(err => err.message))
      }
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'password') {
      validatePassword(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validatePassword(formData.password)) {
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '비밀번호 재설정에 실패했습니다.')
      }

      setStatus('success')
    } catch (error) {
      setStatus('error')
      setError(error instanceof Error ? error.message : '비밀번호 재설정에 실패했습니다.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">새 비밀번호 설정</h1>
        
        {status === 'success' ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-100 text-green-700 rounded">
              비밀번호가 성공적으로 재설정되었습니다.
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              로그인 페이지로 이동
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  새 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-32"
                    required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      {showPassword ? "숨김" : "표시"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const suggestion = generatePassword()
                        setFormData(prev => ({ ...prev, password: suggestion }))
                        validatePassword(suggestion)
                      }}
                      className="px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      추천
                    </button>
                  </div>
                </div>
                {validationErrors.length > 0 && (
                  <div className="mt-2 text-xs space-y-1">
                    {validationErrors.map((error, index) => (
                      <p key={index} className="text-red-600">• {error}</p>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {status === 'loading' ? '처리 중...' : '비밀번호 변경'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
