'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser, getUserByEmail } from '@/lib/db';
import { SignUpForm } from "@/components/SignUpForm"

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 이메일 중복 체크
      const existingUser = await getUserByEmail(formData.email);
      if (existingUser) {
        setError('이미 사용 중인 이메일 주소입니다.');
        return;
      }

      await createUser(formData.email, formData.password, formData.name);
      localStorage.setItem('userEmail', formData.email);
      router.push('/profile');
    } catch (error) {
      console.error('Failed to create user:', error);
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
