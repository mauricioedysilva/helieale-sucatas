"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, EmptyState, Field, Input, PageTitle, Select, Table } from "@/components/ui";

type Pedido = {
  id: string;
  tipo: "COMPRA" | "VENDA";
  data: string;
  valorTotal: number;
  cliente: { nome: string } | null;
  formaPagamento: { nome: string } | null;
  itens: { id: string; quantidade: number; produto: { nome: string; unidade: "KG" | "UNIDADE" } }[];
};

function todayStr() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [tipo, setTipo] = useState("");
  // Por padrão mostra apenas o dia de hoje — a tela "reseta" sozinha a cada virada de dia.
  // Para consultar dias anteriores, é só ajustar o filtro "De"/"Até" abaixo.
  const [de, setDe] = useState(todayStr());
  const [ate, setAte] = useState(todayStr());
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tipo) params.set("tipo", tipo);
      if (de) params.set("de", de);
      if (ate) params.set("ate", ate);
      const res = await fetch(`/api/pedidos?${params.toString()}`);
      setPedidos(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, de, ate]);

  const filtrados = useMemo(() => {
    if (!busca.trim()) return pedidos;
    const termo = busca.trim().toLowerCase();
    return pedidos.filter((p) => p.cliente?.nome.toLowerCase().includes(termo));
  }, [pedidos, busca]);

  const totalCompras = filtrados.filter((p) => p.tipo === "COMPRA").reduce((acc, p) => acc + p.valorTotal, 0);
  const totalVendas = filtrados.filter((p) => p.tipo === "VENDA").reduce((acc, p) => acc + p.valorTotal, 0);

  return (
    <div>
      <PageTitle
        title="Pedidos"
        subtitle="Tudo que entrou (compras) e tudo que saiu (vendas) da empresa — por padrão mostra hoje; ajuste o período para consultar dias anteriores"
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Tipo">
            <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="COMPRA">Somente compras</option>
              <option value="VENDA">Somente vendas</option>
            </Select>
          </Field>
          <Field label="De">
            <Input type="date" value={de} onChange={(e) => setDe(e.target.value)} />
          </Field>
          <Field label="Até">
            <Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
          </Field>
          <Field label="Buscar por cliente">
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome do cliente" />
          </Field>
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total de compras no período</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">R$ {totalCompras.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total de vendas no período</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">R$ {totalVendas.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Pedidos encontrados</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{filtrados.length}</p>
        </Card>
      </div>

      <Card>
        <Table headers={["Data", "Tipo", "Cliente", "Itens", "Forma de pagamento", "Valor"]}>
          {!loading && filtrados.length === 0 && (
            <tr>
              <td colSpan={6}>
                <EmptyState message="Nenhum pedido encontrado para os filtros selecionados." />
              </td>
            </tr>
          )}
          {filtrados.map((pedido) => (
            <tr key={pedido.id}>
              <td className="px-3 py-2 align-top text-slate-600">
                {new Date(pedido.data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </td>
              <td className="px-3 py-2 align-top">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    pedido.tipo === "COMPRA" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {pedido.tipo === "COMPRA" ? "Compra" : "Venda"}
                </span>
              </td>
              <td className="px-3 py-2 align-top font-medium">{pedido.cliente?.nome ?? "—"}</td>
              <td className="px-3 py-2 align-top text-slate-600">
                {pedido.itens.map((i) => `${i.produto.nome} (${i.quantidade}${i.produto.unidade === "KG" ? "kg" : "un"})`).join(", ")}
              </td>
              <td className="px-3 py-2 align-top text-slate-600">{pedido.formaPagamento?.nome ?? "—"}</td>
              <td className="px-3 py-2 align-top font-semibold text-slate-900">R$ {pedido.valorTotal.toFixed(2)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
