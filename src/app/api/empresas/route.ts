import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const empresas = await prisma.empresa.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(empresas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const empresa = await prisma.empresa.create({
    data: {
      nome: body.nome,
      cnpj: body.cnpj || null,
      endereco: body.endereco || null,
      responsavel: body.responsavel || null,
    },
  });
  return NextResponse.json(empresa, { status: 201 });
}
