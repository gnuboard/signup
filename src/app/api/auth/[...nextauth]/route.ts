import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import NaverProvider from "next-auth/providers/naver";
import bcrypt from 'bcryptjs';
import { 
  getUserByEmail,
  createUser,
  initializeDb,
  openDb,
  getSessionAndUser,
  createSessionForUser,
  updateSession,
  deleteUserSession
} from '@/lib/db';
import { randomUUID } from 'crypto';

// authOptions 객체를 먼저 정의
const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.')
        }

        // 이메일로 사용자 조회
        const user = await getUserByEmail(credentials.email)
        
        if (!user) {
          throw new Error('등록되지 않은 이메일입니다.')
        }

        // 소셜 로그인 사용자 체크를 먼저 수행
        if (user.social_id) {
          throw new Error('SocialLoginUser')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('비밀번호가 일치하지 않습니다.')
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.image
        }
      }
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.response.id,
          name: profile.response.name,
          email: profile.response.email,
          image: profile.response.profile_image
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        await initializeDb();

        if (account?.provider === 'google' || account?.provider === 'naver') {
          const existingUser = await getUserByEmail(user.email!);
          if (!existingUser) {
            await createUser({
              email: user.email!,
              name: user.name!,
              image: user.image,
              provider: account.provider,
              social_id: user.id
            });
          } else {
            const db = await openDb();
            await db.run(
              `UPDATE users 
               SET social_id = ?, image = ?, provider = ? , password = NULL 
               WHERE email = ?`,
              [user.id, user.image, account.provider, user.email]
            );
            user.name = existingUser.name;
          }
        }

        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.name) {
        // 세션 업데이트 시 토큰 업데이트
        token.name = session.name;
      }
      if (user) {
        // 초기 로그인 시 토큰 설정
        token.sub = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  }
}

// NextAuth 핸들러 생성
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };
