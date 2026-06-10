import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");

  const where: Record<string, unknown> = {};
  if (tipo === "COMPRA" || tipo === "VENDA") where.tipo = tipo;
  if (de || ate) {
    const data: Record<string, Date> = {};
    if (de) data.gte = new Date(`${de}T00:00:00-03:00`);
    if (ate) data.lte = new Date(`${ate}T23:59:59.999-03:00`);
    where.data = data;
  }

  const pedidos = await prisma.pedido.findMany({
    where,
    orderBy: { data: "desc" },
    include: {
      cliente: true,
      formaPagamento: true,
      itens: { include: { produto: true } },
    },
  });
  return NextResponse.json(pedidos);
}

type ItemInput = { produtoId: string; quantidade: number; valorUnitario: number };

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tipo: "COMPRA" | "VENDA" = body.tipo;
  const itens: ItemInput[] = body.itens ?? [];

  if (!tipo || !["COMPRA", "VENDA"].includes(tipo)) {
    return NextResponse.json({ error: "Tipo de pedido inválido" }, { status: 400 });
  }
  if (itens.length === 0) {
    return NextResponse.json({ error: "Inclua ao menos um item no pedido" }, { status: 400 });
  }

  try {
    const pedido = await prisma.$transaction(async (tx) => {
      const produtos = await tx.produto.findMany({ where: { id: { in: itens.map((i) => i.produtoId) } } });
      const produtoMap = new Map(produtos.map((p) => [p.id, p]));

      let valorTotal = 0;
      const itensData = itens.map((item) => {
        const quantidade = Number(item.quantidade);
        const valorUnitario = Number(item.valorUnitario);
        const subtotal = quantidade * valorUnitario;
        valorTotal += subtotal;
        return { produtoId: item.produtoId, quantidade, valorUnitario, subtotal };
      });

      const novoPedido = await tx.pedido.create({
        data: {
          tipo,
          clienteId: body.clienteId || null,
          formaPagamentoId: body.formaPagamentoId || null,
          observacao: body.observacao || null,
          valorTotal,
          itens: { create: itensData },
        },
        include: { cliente: true, formaPagamento: true, itens: { include: { produto: true } } },
      });

      for (const item of itensData) {
        const produto = produtoMap.get(item.produtoId);
        if (!produto) continue;
        const novoEstoque =
          tipo === "COMPRA" ? produto.estoqueAtual + item.quantidade : produto.estoqueAtual - item.quantidade;
        await tx.produto.update({ where: { id: produto.id }, data: { estoqueAtual: novoEstoque } });
      }

      return novoPedido;
    });

    return NextResponse.json(pedido, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Não foi possível registrar o pedido" }, { status: 500 });
  }
}
