"use client";

import { useEffect, useState } from "react";
import { Button, Card, EmptyState, Table } from "@/components/ui";
import { Comanda, imprimirComanda, type PedidoParaImpressao } from "@/components/Comanda";

type Pedido = PedidoParaImpressao;

function todayStr() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export function PedidoHistorico({ tipo, refreshKey }: { tipo: "COMPRA" | "VENDA"; refreshKey?: number }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidoParaImprimir, setPedidoParaImprimir] = useState<Pedido | null>(null);
  // A tela operacional mostra somente os lançamentos de hoje — a cada virada do dia
  // (00:00) a lista "reseta" sozinha, pois passa a buscar os pedidos do novo dia.
  // O histórico completo continua disponível em Pedidos e Relatórios.
  const [dia, setDia] = useState(todayStr());

  useEffect(() => {
    const id = setInterval(() => {
      const atual = todayStr();
      setDia((anterior) => (anterior !== atual ? atual : anterior));
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ tipo, de: dia, ate: dia });
    fetch(`/api/pedidos?${params.toString()}`)
      .then((r) => r.json())
      .then(setPedidos)
      .finally(() => setLoading(false));
  }, [tipo, dia, refreshKey]);

  function handleImprimir(pedido: Pedido) {
    setPedidoParaImprimir(pedido);
    imprimirComanda();
  }

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold text-slate-700">
        {tipo === "COMPRA" ? "Compras" : "Vendas"} de hoje
        <span className="ml-2 font-normal text-slate-400">
          ({new Date(`${dia}T12:00:00`).toLocaleDateString("pt-BR")})
        </span>
      </h2>
      <p className="mb-3 text-xs text-slate-500">
        Esta lista mostra apenas os lançamentos de hoje e é renovada automaticamente a cada novo dia. Para
        consultar dias anteriores, acesse <span className="font-medium">Pedidos</span> ou{" "}
        <span className="font-medium">Relatórios</span>.
      </p>
      <Table headers={["Data", "Cliente", "Itens", "Forma de pagamento", "Total", ""]}>
        {!loading && pedidos.length === 0 && (
          <tr>
            <td colSpan={6}>
              <EmptyState message={`Nenhuma ${tipo === "COMPRA" ? "compra" : "venda"} registrada hoje ainda.`} />
            </td>
          </tr>
        )}
        {pedidos.map((pedido) => (
          <tr key={pedido.id}>
            <td className="px-3 py-2 align-top text-slate-600">
              {new Date(pedido.data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </td>
            <td className="px-3 py-2 align-top font-medium">{pedido.cliente?.nome ?? "—"}</td>
            <td className="px-3 py-2 align-top text-slate-600">
              <ul className="flex flex-col gap-0.5">
                {pedido.itens.map((item) => (
                  <li key={item.id}>
                    {item.produto.nome}: {item.quantidade} {item.produto.unidade === "KG" ? "kg" : "un"} × R${" "}
                    {item.valorUnitario.toFixed(2)} = R$ {item.subtotal.toFixed(2)}
                  </li>
                ))}
              </ul>
            </td>
            <td className="px-3 py-2 align-top text-slate-600">{pedido.formaPagamento?.nome ?? "—"}</td>
            <td className="px-3 py-2 align-top font-semibold text-slate-900">R$ {pedido.valorTotal.toFixed(2)}</td>
            <td className="px-3 py-2 align-top text-right">
              <Button variant="secondary" onClick={() => handleImprimir(pedido)}>
                Imprimir comanda
              </Button>
            </td>
          </tr>
        ))}
      </Table>

      <Comanda pedido={pedidoParaImprimir} />
    </Card>
  );
}
