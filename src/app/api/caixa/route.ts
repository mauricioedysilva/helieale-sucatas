import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function dayRange(dataStr: string) {
  const inicio = new Date(`${dataStr}T00:00:00-03:00`);
  const fim = new Date(`${dataStr}T23:59:59.999-03:00`);
  return { gte: inicio, lte: fim };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataStr = searchParams.get("data") || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const range = dayRange(dataStr);

  const [caixa, compras, vendas, gastos] = await Promise.all([
    prisma.caixa.findFirst({ where: { data: range } }),
    prisma.pedido.aggregate({ where: { tipo: "COMPRA", data: range }, _sum: { valorTotal: true } }),
    prisma.pedido.aggregate({ where: { tipo: "VENDA", data: range }, _sum: { valorTotal: true } }),
    prisma.gasto.aggregate({ where: { data: range }, _sum: { valor: true } }),
  ]);

  const totalCompras = compras._sum.valorTotal ?? 0;
  const totalVendas = vendas._sum.valorTotal ?? 0;
  const totalGastos = gastos._sum.valor ?? 0;
  const valorAbertura = caixa?.valorAbertura ?? 0;
  const saldo = valorAbertura + totalVendas - totalCompras - totalGastos;

  return NextResponse.json({ caixa, totalCompras, totalVendas, totalGastos, saldo, data: dataStr });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const dataStr: string = body.data || new Date().toISOString().slice(0, 10);
  const range = dayRange(dataStr);

  const existente = await prisma.caixa.findFirst({ where: { data: range } });
  if (existente) {
    return NextResponse.json({ error: "O caixa deste dia já foi aberto." }, { status: 409 });
  }

  const caixa = await prisma.caixa.create({
    data: {
      data: new Date(`${dataStr}T00:00:01`),
      valorAbertura: Number(body.valorAbertura),
      observacao: body.observacao || null,
    },
  });
  return NextResponse.json(caixa, { status: 201 });
}
