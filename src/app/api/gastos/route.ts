import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");

  const where: Record<string, unknown> = {};
  if (de || ate) {
    const data: Record<string, Date> = {};
    if (de) data.gte = new Date(`${de}T00:00:00`);
    if (ate) data.lte = new Date(`${ate}T23:59:59`);
    where.data = data;
  }

  const gastos = await prisma.gasto.findMany({ where, orderBy: { data: "desc" } });
  return NextResponse.json(gastos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const gasto = await prisma.gasto.create({
    data: {
      nome: body.nome,
      valor: Number(body.valor),
      data: body.data ? new Date(`${body.data}T12:00:00`) : new Date(),
    },
  });
  return NextResponse.json(gasto, { status: 201 });
}
