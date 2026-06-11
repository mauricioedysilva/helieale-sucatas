import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageTitle, Table } from "@/components/ui";

export default async function EstoquePage() {
  const produtos = await prisma.produto.findMany({ orderBy: { nome: "asc" } });
  const semEstoque = produtos.filter((p) => p.estoqueAtual <= 0);

  return (
    <div>
      <PageTitle
        title="Estoque"
        subtitle="Quantidade atual de cada material no pátio — atualizado automaticamente por Compras e Vendas"
      />

      {semEstoque.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <p className="font-semibold text-red-700">
            ⚠ {semEstoque.length} produto(s) sem estoque: {semEstoque.map((p) => p.nome).join(", ")}
          </p>
        </Card>
      )}

      <Card>
        <Table headers={["Produto", "Unidade", "Quantidade em estoque", "Situação"]}>
          {produtos.length === 0 && (
            <tr>
              <td colSpan={4}>
                <EmptyState message="Nenhum produto cadastrado ainda." />
              </td>
            </tr>
          )}
          {produtos.map((produto) => {
            const esgotado = produto.estoqueAtual <= 0;
            return (
              <tr key={produto.id}>
                <td className="px-3 py-2 font-medium">{produto.nome}</td>
                <td className="px-3 py-2 text-slate-600">{produto.unidade === "KG" ? "kg" : "unidade"}</td>
                <td className="px-3 py-2 font-semibold" style={{ color: esgotado ? "#B03030" : "#1A6B1A" }}>
                  {produto.estoqueAtual} {produto.unidade === "KG" ? "kg" : "un"}
                </td>
                <td className="px-3 py-2">
                  {esgotado ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Sem estoque
                    </span>
                  ) : (
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "#DFF0D8", color: "#1A6B1A" }}>
                      Disponível
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
