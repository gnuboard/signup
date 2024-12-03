'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setStatus('success')
      setMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '이메일 전송에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">비밀번호 재설정</h1>
          <p className="mt-2 text-sm text-gray-600">
            가입하신 이메일로 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        {status === 'success' ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-md">
              <p className="text-green-800">{message}</p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>

            {status === 'error' && (
              <div className="p-4 bg-red-50 rounded-md">
                <p className="text-red-800">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {status === 'loading' ? '처리 중...' : '재설정 링크 받기'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                로그인 페이지로 돌아가기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
