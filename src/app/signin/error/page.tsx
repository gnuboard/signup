'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignInErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'AccessDenied':
        return '로그인이 거부되었습니다. 회원가입이 필요합니다.';
      case 'Verification':
        return '이메일 인증에 실패했습니다.';
      case 'OAuthSignin':
        return '소셜 로그인 과정에서 문제가 발생했습니다.';
      case 'OAuthCallback':
        return '소셜 로그인 콜백 과정에서 문제가 발생했습니다.';
      case 'Configuration':
        return '서버 설정에 문제가 있습니다.';
      default:
        return '로그인 중 오류가 발생했습니다.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인 오류
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getErrorMessage(error || '')}
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link 
            href="/signin"
            className="text-indigo-600 hover:text-indigo-500"
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
} 