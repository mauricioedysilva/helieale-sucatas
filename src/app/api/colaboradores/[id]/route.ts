import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const colaborador = await prisma.colaborador.update({
    where: { id },
    data: {
      nome: body.nome,
      salario: Number(body.salario),
    },
  });
  return NextResponse.json(colaborador);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.colaborador.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
