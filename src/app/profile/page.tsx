'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserByEmail, updateUser, deleteUser } from '@/lib/db';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
  });

  useEffect(() => {
    // 실제 구현에서는 세션/쿠키에서 이메일을 가져와야 합니다
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/');
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await getUserByEmail(email);
        if (userData) {
          setUser(userData);
          setFormData({ name: userData.name, password: '' });
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    try {
      const updateData: { name?: string; password?: string } = {};
      if (formData.name !== user.name) updateData.name = formData.name;
      if (formData.password) updateData.password = formData.password;

      await updateUser(user.email, updateData);
      setIsEditing(false);
      // 업데이트 후 사용자 정보 새로고침
      const updatedUser = await getUserByEmail(user.email);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDelete = async () => {
    if (!user?.email || !confirm('정말 탈퇴하시겠습니까?')) return;

    try {
      await deleteUser(user.email);
      localStorage.removeItem('userEmail');
      router.push('/');
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">내 정보</h1>
      
      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">새 비밀번호</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="변경하지 않으려면 비워두세요"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              저장
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <p className="mt-1 px-3 py-2 bg-gray-100 rounded">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">이름</label>
            <p className="mt-1 px-3 py-2 bg-gray-100 rounded">{user.name}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              회원탈퇴
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
