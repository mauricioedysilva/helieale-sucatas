import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

/**
 * Lê o cookie de sessão da requisição atual e retorna o usuário logado
 * (sem o campo `senha`), ou `null` se não houver sessão válida.
 * Use apenas em rotas de API / Server Components (precisa de `next/headers`).
 */
export async function getUsuarioLogado() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token, secret);
  if (!session) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.userId },
    select: { id: true, nome: true, login: true },
  });
  return usuario;
}
