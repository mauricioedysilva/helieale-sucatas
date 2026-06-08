import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");

  const range: { gte?: Date; lte?: Date } = {};
  if (de) range.gte = new Date(`${de}T00:00:00`);
  if (ate) range.lte = new Date(`${ate}T23:59:59.999`);

  const [pedidos, gastosAgg, produtos] = await Promise.all([
    prisma.pedido.findMany({
      where: { data: range },
      include: { itens: { include: { produto: true } } },
    }),
    prisma.gasto.aggregate({ where: { data: range }, _sum: { valor: true } }),
    prisma.produto.findMany({ orderBy: { nome: "asc" } }),
  ]);

  const compras = pedidos.filter((p) => p.tipo === "COMPRA");
  const vendas = pedidos.filter((p) => p.tipo === "VENDA");
  const totalCompras = compras.reduce((acc, p) => acc + p.valorTotal, 0);
  const totalVendas = vendas.reduce((acc, p) => acc + p.valorTotal, 0);
  const totalGastos = gastosAgg._sum.valor ?? 0;

  type ProdutoResumo = {
    produtoId: string;
    nome: string;
    unidade: "KG" | "UNIDADE";
    quantidadeComprada: number;
    valorComprado: number;
    quantidadeVendida: number;
    valorVendido: number;
  };

  const porProdutoMap = new Map<string, ProdutoResumo>();
  for (const pedido of pedidos) {
    for (const item of pedido.itens) {
      const key = item.produtoId;
      if (!porProdutoMap.has(key)) {
        porProdutoMap.set(key, {
          produtoId: key,
          nome: item.produto.nome,
          unidade: item.produto.unidade,
          quantidadeComprada: 0,
          valorComprado: 0,
          quantidadeVendida: 0,
          valorVendido: 0,
        });
      }
      const resumo = porProdutoMap.get(key)!;
      if (pedido.tipo === "COMPRA") {
        resumo.quantidadeComprada += item.quantidade;
        resumo.valorComprado += item.subtotal;
      } else {
        resumo.quantidadeVendida += item.quantidade;
        resumo.valorVendido += item.subtotal;
      }
    }
  }

  return NextResponse.json({
    de,
    ate,
    totalCompras,
    totalVendas,
    totalGastos,
    resultado: totalVendas - totalCompras - totalGastos,
    quantidadeCompras: compras.length,
    quantidadeVendas: vendas.length,
    porProduto: Array.from(porProdutoMap.values()).sort((a, b) => a.nome.localeCompare(b.nome)),
    estoqueAtual: produtos.map((p) => ({
      nome: p.nome,
      unidade: p.unidade,
      estoqueAtual: p.estoqueAtual,
      estoqueMinimo: p.estoqueMinimo,
    })),
  });
}
