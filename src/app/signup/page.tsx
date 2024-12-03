'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignUpForm } from "@/components/SignUpForm"
import { signIn } from 'next-auth/react';
import { generateRandomUsername } from '@/lib/constants';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      // 회원가입 성공 후 로그인 시도
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push('/profile');
    } catch (error) {
      console.error('Failed to sign up:', error);
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">회원가입</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <SignUpForm 
          formData={formData} 
          setFormData={setFormData} 
          handleSubmit={handleSubmit} 
        />
      </div>
    </main>
  );
}
