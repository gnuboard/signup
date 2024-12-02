'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { profileUpdateSchema, validateForm, ValidationError } from '@/lib/validations';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationError>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      const fetchUser = async () => {
        try {
          const response = await fetch('/api/user');
          const data = await response.json();
          
          if (data.error) {
            setError(data.error);
            return;
          }
          
          if (data.user) {
            setUser(data.user);
            setFormData({ name: data.user.name, password: '' });
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          setError('사용자 정보를 불러오는데 실패했습니다.');
        }
      };

      fetchUser();
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors } = validateForm(profileUpdateSchema, formData);
    
    if (!isValid) {
      setErrors(errors);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const updateData: { name?: string; password?: string } = {};
      if (formData.name !== user.name) updateData.name = formData.name;
      if (formData.password) updateData.password = formData.password;

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setMessage('프로필이 성공적으로 업데이트되었습니다.');
      if (!formData.password) {
        setFormData({ ...formData, password: '' });
      }
      setUser({ ...user, name: formData.name });
      setIsEditing(false);
    } catch (error) {
      setMessage('프로필 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
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
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                새 비밀번호 (선택사항)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                  disabled={isLoading}
                >
                  {showPassword ? "숨김" : "표시"}
                </button>
              </div>
              <ErrorMessage errors={errors.password} />
            </div>

            {message && (
              <div className={`mt-2 text-sm ${message.includes('실패') ? 'text-red-600' : 'text-green-600'}`}>
                {message}
              </div>
            )}

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
                  setFormData({ name: user.name, password: '' });
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
