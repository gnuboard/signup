"use client"

import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Logo
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
