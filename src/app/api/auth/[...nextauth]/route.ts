import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
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

const handler = NextAuth({
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

        const user = await getUserByEmail(credentials.email)
        if (!user) {
          throw new Error('등록되지 않은 이메일입니다.')
        }

        if (!user.password) {
          throw new Error('소셜 로그인으로 가입된 계정입니다.')
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
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        await initializeDb();

        if (account?.provider === 'google') {
          const existingUser = await getUserByEmail(user.email!);
          if (!existingUser) {
            await createUser({
              email: user.email!,
              name: user.name!,
              image: user.image,
              provider: 'google',
              social_id: user.id
            });
          }
        }
        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  }
});

export { handler as GET, handler as POST };
