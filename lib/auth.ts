// lib/auth.ts
import { AuthOptions, DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { Role, User } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

// Расширяем стандартные типы NextAuth, чтобы включить наши кастомные поля
declare module 'next-auth' {
  /**
   * Добавляем расширение для интерфейса User,
   * чтобы TypeScript "знал" о наших кастомных полях.
   */
  interface User {
    role: Role;
    isProfileSetupComplete: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      isProfileSetupComplete: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /** Расширяем токен JWT */
  interface JWT {
    id: string;
    role: Role;
    isProfileSetupComplete: boolean;
    picture?: string | null;
  }
}

export const authOptions: AuthOptions = {
    // Явно типизируем адаптер для TypeScript
    adapter: PrismaAdapter(prisma) as AuthOptions['adapter'],
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) return null;

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (isPasswordValid) return user;
                
                return null;
            }
        })
    ],
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            // При первом входе `user` объект доступен
            if (user) {
                // ИСПРАВЛЕНИЕ: Используем утверждение типа (as User), чтобы TypeScript
                // понял, что мы работаем с нашим расширенным типом User, у которого есть role.
                token.id = user.id;
                token.role = (user as User).role;
                token.isProfileSetupComplete = (user as User).isProfileSetupComplete;
                token.picture = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            // Передаем актуальные данные из токена в объект сессии
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.image = token.picture;
                session.user.isProfileSetupComplete = token.isProfileSetupComplete;
            }
            return session;
        },
    },
};
