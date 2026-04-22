import { NextResponse } from "next/server";
import {
  createSession,
  getSessionMaxAge,
  SESSION_COOKIE_NAME,
  verifyPassword,
} from "@/lib/auth";
import { getFirstMenuRouteByRole } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Credenciais inválidas." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: "E-mail ou senha inválidos." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: "E-mail ou senha inválidos." }, { status: 401 });
    }

    const token = await createSession(user.id);
    const response = NextResponse.json({
      success: true,
      redirectTo: getFirstMenuRouteByRole(user.role),
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: getSessionMaxAge(),
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: "Erro interno." }, { status: 500 });
  }
}