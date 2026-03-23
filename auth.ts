import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  logger: {
    error(code, ...message) {
      const authErrorCode =
        typeof code === "string"
          ? code
          : (code as { type?: string; name?: string }).type ??
            (code as { name?: string }).name ??
            "UnknownAuthError";

      if (authErrorCode === "CredentialsSignin") return;
      console.error("[auth][error]", authErrorCode, ...message);
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials.email as string | undefined)?.trim().toLowerCase();
        const password = credentials.password as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const senhaArmazenada = user.senha;
        const isBcryptHash = /^\$2[aby]\$/.test(senhaArmazenada);

        let valid = false;
        if (isBcryptHash) {
          valid = await bcrypt.compare(password, senhaArmazenada);
        } else {
          // Migra senha legada em texto puro para hash no primeiro login válido.
          valid = password === senhaArmazenada;
          if (valid) {
            const novaSenhaHash = await bcrypt.hash(password, 10);
            await prisma.user.update({
              where: { id: user.id },
              data: { senha: novaSenhaHash },
            });
          }
        }

        if (!valid) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.nome,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id);
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: number; role: string }).id = Number(token.id);
        (session.user as { id: number; role: string }).role =
          (token.role as string) ?? "solicitante";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
