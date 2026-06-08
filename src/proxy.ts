import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

// Proxy (antigo "middleware" — renomeado a partir do Next.js 16) que roda antes de
// cada requisição: verifica se existe uma sessão válida e, caso não exista,
// redireciona para a tela de login. Protege tanto páginas quanto rotas de API.

// Caminhos que podem ser acessados sem estar logado.
const PUBLIC_PATHS = ["/login", "/api/login"];

// Extensões de arquivos estáticos servidos a partir de /public (ícones, imagens, etc.)
const STATIC_FILE_REGEX = /\.(svg|png|jpg|jpeg|gif|ico|css|js|map|webp|txt|woff2?)$/i;

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return true;
  }
  if (pathname.startsWith("/_next")) return true;
  if (STATIC_FILE_REGEX.test(pathname)) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (secret && token) {
    const session = await verifySessionToken(token, secret);
    if (session) {
      return NextResponse.next();
    }
  }

  // Não autenticado: redireciona para a tela de login, preservando a página de destino.
  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") {
    loginUrl.searchParams.set("redirect", pathname);
  }

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
