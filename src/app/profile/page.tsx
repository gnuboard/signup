'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { profileUpdateSchema, validateForm, ValidationError } from '@/lib/validations';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<ValidationError>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      const fetchUser = async () => {
        try {
          const response = await fetch('/api/user');
          const data = await response.json();
          
          if (data.user) {
            setUser(data.user);
            setFormData({ name: data.user.name });
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          setError('Failed to load user data');
        }
      };

      fetchUser();
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const updateData: { name?: string } = {};
      if (formData.name !== user.name) updateData.name = formData.name;

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();

      // 세션 데이터 업데이트
      await updateSession(data.session);

      setMessage('프로필이 성공적으로 업데이트되었습니다.');
      setUser(data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6">프로필</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {message && (
          <div className={`mt-2 text-sm ${message.includes('실패') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </div>
        )}
        
        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">이메일</label>
              <p className="mt-1">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <p className="mt-1">{user?.name}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              프로필 수정
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">이메일</label>
              <p className="mt-1">{user?.email}</p>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
              <ErrorMessage errors={errors.name} />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? '업데이트 중...' : '저장'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ name: user.name });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
