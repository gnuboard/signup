import { queries } from '@/lib/db';
import { CreateUserInput, User } from '@/types/user';
import { hash } from 'bcryptjs';

export class UserService {
  static async createUser(input: CreateUserInput): Promise<User> {
    try {
      // 이메일 중복 체크
      const existingUser = queries.getUserByEmail.get(input.email) as User | undefined;
      if (existingUser) {
        throw new Error('이미 존재하는 이메일입니다.');
      }

      // 비밀번호 해시화
      const hashedPassword = await hash(input.password, 12);

      // 사용자 생성
      const result = queries.createUser.run({
        email: input.email,
        password: hashedPassword,
        name: input.name,
      });

      // 생성된 사용자 정보 반환
      return queries.getUserById.get(result.lastInsertRowid) as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static getUserByEmail(email: string): User | undefined {
    return queries.getUserByEmail.get(email) as User | undefined;
  }
}
