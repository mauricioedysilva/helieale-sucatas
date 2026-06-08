import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const produto = await prisma.produto.update({
    where: { id },
    data: {
      nome: body.nome,
      unidade: body.unidade === "UNIDADE" ? "UNIDADE" : "KG",
      valorUnitario: Number(body.valorUnitario),
      estoqueAtual: Number(body.estoqueAtual ?? 0),
      estoqueMinimo: Number(body.estoqueMinimo ?? 0),
    },
  });
  return NextResponse.json(produto);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.produto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
