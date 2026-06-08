import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageTitle, Table } from "@/components/ui";

export default async function EstoquePage() {
  const produtos = await prisma.produto.findMany({ orderBy: { nome: "asc" } });
  const baixos = produtos.filter((p) => p.estoqueAtual <= p.estoqueMinimo);

  return (
    <div>
      <PageTitle
        title="Estoque"
        subtitle="Quantidade atual de cada material no pátio — atualizado automaticamente por Compras e Vendas"
      />

      {baixos.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <p className="font-semibold text-red-700">⚠ Atenção: {baixos.length} produto(s) com estoque baixo ou esgotado</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-red-700">
            {baixos.map((p) => (
              <li key={p.id}>
                {p.nome}: restam {p.estoqueAtual} {p.unidade === "KG" ? "kg" : "un"} (mínimo configurado: {p.estoqueMinimo})
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <Table headers={["Produto", "Unidade", "Quantidade em estoque", "Estoque mínimo", "Situação"]}>
          {produtos.length === 0 && (
            <tr>
              <td colSpan={5}>
                <EmptyState message="Nenhum produto cadastrado ainda. Cadastre produtos para começar a controlar o estoque." />
              </td>
            </tr>
          )}
          {produtos.map((produto) => {
            const baixo = produto.estoqueAtual <= produto.estoqueMinimo;
            const esgotado = produto.estoqueAtual <= 0;
            return (
              <tr key={produto.id}>
                <td className="px-3 py-2 font-medium">{produto.nome}</td>
                <td className="px-3 py-2 text-slate-600">{produto.unidade === "KG" ? "kg" : "unidade"}</td>
                <td className="px-3 py-2">
                  <span className={baixo ? "font-semibold text-red-600" : "text-slate-800"}>
                    {produto.estoqueAtual} {produto.unidade === "KG" ? "kg" : "un"}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {produto.estoqueMinimo} {produto.unidade === "KG" ? "kg" : "un"}
                </td>
                <td className="px-3 py-2">
                  {esgotado ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Esgotado</span>
                  ) : baixo ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Estoque baixo</span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Normal</span>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <p className="mt-4 text-sm text-slate-500">
        Para ajustar o estoque inicial ou o limite mínimo de alerta de um produto, edite o cadastro em{" "}
        <Link href="/produtos" className="font-medium text-emerald-700 hover:underline">
          Produtos
        </Link>
        .
      </p>
    </div>
  );
}
