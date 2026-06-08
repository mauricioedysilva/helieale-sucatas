import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const empresa = await prisma.empresa.update({
    where: { id },
    data: {
      nome: body.nome,
      cnpj: body.cnpj || null,
      endereco: body.endereco || null,
      responsavel: body.responsavel || null,
    },
  });
  return NextResponse.json(empresa);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.empresa.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
