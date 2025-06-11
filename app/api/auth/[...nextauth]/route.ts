// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

// Расширяем стандартные типы NextAuth, чтобы включить наши кастомные поля
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
    };
  }
  interface User extends NextAuthUser {
      role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    name: string;
    email: string;
  }
}

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
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
                
                // Ищем пользователя в базе данных по email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                // В реальном приложении здесь должна быть проверка хешированного пароля.
                // Для простоты мы сравниваем пароли напрямую.
                if (user && user.password === credentials.password) {
                    // Возвращаем все необходимые данные
                    return { 
                        id: user.id, 
                        name: user.name, 
                        email: user.email, 
                        role: user.role 
                    };
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
        // Вызывается при создании JWT
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.name = user.name || '';
                token.email = user.email || '';
            }
            return token;
        },
        // Вызывается при создании сессии
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.name = token.name;
                session.user.email = token.email;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
