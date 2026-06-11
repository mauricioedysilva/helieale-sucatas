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

  const vinculado = await prisma.itemPedido.count({ where: { produtoId: id } });
  if (vinculado > 0) {
    return NextResponse.json(
      { error: `Este produto não pode ser excluído pois está vinculado a ${vinculado} pedido(s) registrado(s). Edite o nome caso queira renomeá-lo.` },
      { status: 409 }
    );
  }

  await prisma.produto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
