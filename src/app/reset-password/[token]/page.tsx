'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

export default function ResetPasswordWithToken({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 8) {
      setStatus('error')
      setMessage('비밀번호는 8자 이상이어야 합니다.')
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
          password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '비밀번호 재설정에 실패했습니다.')
      }

      setStatus('success')
      setMessage('비밀번호가 성공적으로 재설정되었습니다.')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '비밀번호 재설정에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">새 비밀번호 설정</h1>
          <p className="mt-2 text-sm text-gray-600">
            새로운 비밀번호를 입력해주세요.
          </p>
        </div>

        {status === 'success' ? (
          <div className="p-4 bg-green-50 rounded-md">
            <p className="text-green-800">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                새 비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
                minLength={8}
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
              {status === 'loading' ? '처리 중...' : '비밀번호 변경'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
