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
   * ИСПРАВЛЕНИЕ: Добавляем расширение для интерфейса User,
   * чтобы TypeScript "знал" о нашей кастомной роли.
   */
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    name: string;
    email: string;
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
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (isPasswordValid) {
                    return user; // Prisma-адаптер ожидает полную модель User
                } else {
                    return null;
                }
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
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                token.role = user.role; // Теперь эта строка не будет вызывать ошибку
                token.name = user.name!;
                token.email = user.email!;
                token.picture = user.image;
            }

            if (trigger === "update") {
                const dbUser = await prisma.user.findUnique({ where: { id: token.id } });
                if (dbUser) {
                    token.name = dbUser.name;
                    token.picture = dbUser.image;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.image = token.picture;
                session.user.name = token.name;
            }
            return session;
        },
    },
};
