import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const caixa = await prisma.caixa.update({
    where: { id },
    data: { valorFechamento: Number(body.valorFechamento) },
  });
  return NextResponse.json(caixa);
}
