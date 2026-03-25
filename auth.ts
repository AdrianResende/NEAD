import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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

        const senhaArmazenada = user.password;
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
              data: { password: novaSenhaHash },
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
});
