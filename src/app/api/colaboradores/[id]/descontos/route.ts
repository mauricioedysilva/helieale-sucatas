import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const desconto = await prisma.descontoColaborador.create({
    data: {
      colaboradorId: id,
      valor: Number(body.valor),
      motivo: body.motivo || null,
      data: body.data ? new Date(body.data) : new Date(),
    },
  });
  return NextResponse.json(desconto, { status: 201 });
}
