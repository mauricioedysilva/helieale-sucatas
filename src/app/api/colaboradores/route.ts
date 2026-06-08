import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const colaboradores = await prisma.colaborador.findMany({
    orderBy: { nome: "asc" },
    include: { vales: { orderBy: { data: "desc" } }, descontos: { orderBy: { data: "desc" } } },
  });
  return NextResponse.json(colaboradores);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const colaborador = await prisma.colaborador.create({
    data: {
      nome: body.nome,
      salario: Number(body.salario),
    },
  });
  return NextResponse.json(colaborador, { status: 201 });
}
