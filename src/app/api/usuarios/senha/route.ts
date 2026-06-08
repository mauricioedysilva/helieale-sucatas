import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado } from "@/lib/auth";

export async function PUT(request: Request) {
  const usuarioLogado = await getUsuarioLogado();
  if (!usuarioLogado) {
    return NextResponse.json({ error: "Sessão inválida. Faça login novamente." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const senhaAtual = typeof body?.senhaAtual === "string" ? body.senhaAtual : "";
  const novaSenha = typeof body?.novaSenha === "string" ? body.novaSenha : "";

  if (!senhaAtual || !novaSenha) {
    return NextResponse.json({ error: "Informe a senha atual e a nova senha." }, { status: 400 });
  }
  if (novaSenha.length < 6) {
    return NextResponse.json({ error: "A nova senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioLogado.id } });
  if (!usuario) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const senhaAtualConfere = await compare(senhaAtual, usuario.senha);
  if (!senhaAtualConfere) {
    return NextResponse.json({ error: "A senha atual informada está incorreta." }, { status: 401 });
  }

  const novoHash = await hash(novaSenha, 10);
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { senha: novoHash },
  });

  return NextResponse.json({ ok: true });
}
