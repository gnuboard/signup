"use client"

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { FaUserCircle } from 'react-icons/fa'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  // 메뉴 외부 클릭시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Logo
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {status === 'authenticated' ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FaUserCircle className="w-8 h-8" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex justify-center mb-3">
                        <FaUserCircle className="w-16 h-16 text-gray-600" />
                      </div>
                      <div className="text-sm text-gray-600 text-center mb-1">
                        {session.user?.email}
                      </div>
                      <div className="font-medium text-gray-900 text-center">
                        {session.user?.name}
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          router.push('/profile')
                        }}
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        프로필 보기
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
