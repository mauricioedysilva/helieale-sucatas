import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, PageTitle } from "@/components/ui";

export default async function Home() {
  const [clientes, produtos, pedidosHoje] = await Promise.all([
    prisma.cliente.count(),
    prisma.produto.count(),
    prisma.pedido.count({
      where: { data: { gte: new Date(`${new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date())}T00:00:00-03:00`) } },
    }),
  ]);

  const cards = [
    { label: "Clientes cadastrados", value: clientes, href: "/clientes" },
    { label: "Produtos cadastrados", value: produtos, href: "/produtos" },
    { label: "Pedidos hoje", value: pedidosHoje, href: "/pedidos" },
  ];

  return (
    <div>
      <PageTitle title="Sucatas Alumínio" subtitle="Painel inicial do sistema de gestão" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="transition-shadow hover:shadow-md">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <p className="text-sm text-slate-600">
          Use o menu à esquerda para lançar Compras e Vendas, consultar o Estoque, gerenciar Cadastros, acompanhar o
          Financeiro e gerar Relatórios.
        </p>
      </Card>
    </div>
  );
}
