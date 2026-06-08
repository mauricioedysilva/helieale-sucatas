import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const formas = await prisma.formaPagamento.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(formas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const forma = await prisma.formaPagamento.create({
    data: { nome: body.nome },
  });
  return NextResponse.json(forma, { status: 201 });
}
