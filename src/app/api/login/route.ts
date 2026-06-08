import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session";

export async function POST(request: Request) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Configuração do servidor incompleta (SESSION_SECRET ausente)." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const login = typeof body?.login === "string" ? body.login.trim() : "";
  const senha = typeof body?.senha === "string" ? body.senha : "";

  if (!login || !senha) {
    return NextResponse.json({ error: "Informe usuário e senha." }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({ where: { login } });
  if (!usuario) {
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }

  const senhaConfere = await compare(senha, usuario.senha);
  if (!senhaConfere) {
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }

  const token = await createSessionToken(usuario.id, secret, SESSION_MAX_AGE_SECONDS);

  const response = NextResponse.json({ ok: true, nome: usuario.nome });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
