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
      image?: string | null; // Добавляем аватар в сессию
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
    picture?: string | null; // Используем 'picture' для аватара в токене
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
                
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (user && user.password === credentials.password) {
                    return { 
                        id: user.id, 
                        name: user.name, 
                        email: user.email, 
                        role: user.role,
                        image: user.image,
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
        async jwt({ token, user, trigger, session }) {
            // При первом входе
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.name = user.name || '';
                token.email = user.email || '';
                token.picture = user.image;
            }

            // ИСПРАВЛЕНИЕ: Когда мы вызываем update(), этот блок срабатывает
            if (trigger === "update") {
                // Перезагружаем пользователя из базы данных, чтобы получить свежие данные
                const dbUser = await prisma.user.findUnique({ where: { id: token.id } });
                if (dbUser) {
                    token.name = dbUser.name;
                    token.picture = dbUser.image;
                }
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
                session.user.image = token.picture; // Передаем аватар из токена в сессию
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
