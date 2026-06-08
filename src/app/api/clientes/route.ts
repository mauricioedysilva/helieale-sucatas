import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cliente = await prisma.cliente.create({
    data: {
      nome: body.nome,
      celular: body.celular || null,
      endereco: body.endereco || null,
      cpf: body.cpf || null,
    },
  });
  return NextResponse.json(cliente, { status: 201 });
}
