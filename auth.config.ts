import type { NextAuthConfig } from "next-auth";

const authConfig = {
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
} satisfies NextAuthConfig;

export default authConfig;