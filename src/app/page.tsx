import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, PageTitle } from "@/components/ui";

export default async function Home() {
  const [clientes, produtos, pedidosHoje, estoqueBaixo] = await Promise.all([
    prisma.cliente.count(),
    prisma.produto.count(),
    prisma.pedido.count({
      where: { data: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.produto.findMany({ where: {} }).then((produtos) => produtos.filter((p) => p.estoqueAtual <= p.estoqueMinimo)),
  ]);

  const cards = [
    { label: "Clientes cadastrados", value: clientes, href: "/clientes" },
    { label: "Produtos cadastrados", value: produtos, href: "/produtos" },
    { label: "Pedidos hoje", value: pedidosHoje, href: "/pedidos" },
    { label: "Produtos com estoque baixo", value: estoqueBaixo.length, href: "/estoque" },
  ];

  return (
    <div>
      <PageTitle title="HelieAle Sucatas" subtitle="Painel inicial do sistema de gestão" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="transition-shadow hover:shadow-md">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      {estoqueBaixo.length > 0 && (
        <Card className="mt-6 border-red-200 bg-red-50">
          <p className="font-semibold text-red-700">Atenção: estoque baixo</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-red-700">
            {estoqueBaixo.map((p) => (
              <li key={p.id}>
                {p.nome}: {p.estoqueAtual} {p.unidade === "KG" ? "kg" : "un"} (mínimo {p.estoqueMinimo})
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mt-6">
        <p className="text-sm text-slate-600">
          Use o menu à esquerda para lançar Compras e Vendas, consultar o Estoque, gerenciar Cadastros, acompanhar o
          Financeiro e gerar Relatórios.
        </p>
      </Card>
    </div>
  );
}
