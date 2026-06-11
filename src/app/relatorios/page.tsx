"use client";

import { useEffect, useState } from "react";
import { Button, Card, EmptyState, Field, Input, PageTitle, Table } from "@/components/ui";
import { ComandaFechamento, type FechamentoParaImpressao } from "@/components/ComandaFechamento";
import { imprimirRecibo } from "@/components/Comanda";

type CaixaResumo = {
  caixa: { id: string; valorAbertura: number; valorFechamento: number | null } | null;
  totalCompras: number;
  totalVendas: number;
  totalGastos: number;
  saldo: number;
  data: string;
};

type Relatorio = {
  de: string | null;
  ate: string | null;
  totalCompras: number;
  totalVendas: number;
  totalGastos: number;
  resultado: number;
  quantidadeCompras: number;
  quantidadeVendas: number;
  porProduto: {
    produtoId: string;
    nome: string;
    unidade: "KG" | "UNIDADE";
    quantidadeComprada: number;
    valorComprado: number;
    quantidadeVendida: number;
    valorVendido: number;
  }[];
  estoqueAtual: { nome: string; unidade: "KG" | "UNIDADE"; estoqueAtual: number; estoqueMinimo: number }[];
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default function RelatoriosPage() {
  const [de, setDe] = useState(firstDayOfMonth());
  const [ate, setAte] = useState(todayStr());
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(true);

  const [caixaHoje, setCaixaHoje] = useState<CaixaResumo | null>(null);
  const [valorFechamentoInput, setValorFechamentoInput] = useState("");
  const [fechamentoImpressao, setFechamentoImpressao] = useState<FechamentoParaImpressao | null>(null);
  const [fechando, setFechando] = useState(false);

  const ehHoje = de === todayStr() && ate === todayStr();

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ de, ate });
      const res = await fetch(`/api/relatorios?${params.toString()}`);
      setRelatorio(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function loadCaixaHoje() {
    const res = await fetch(`/api/caixa?data=${todayStr()}`);
    const json: CaixaResumo = await res.json();
    setCaixaHoje(json);
    setValorFechamentoInput(
      json.caixa?.valorFechamento != null ? String(json.caixa.valorFechamento) : json.saldo.toFixed(2)
    );
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [de, ate]);

  useEffect(() => {
    if (ehHoje) {
      loadCaixaHoje();
    } else {
      setCaixaHoje(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ehHoje]);

  function imprimir() {
    window.print();
  }

  async function fecharEImprimir() {
    if (!relatorio) return;
    setFechando(true);
    try {
      let caixaAtual = caixaHoje?.caixa ?? null;

      if (caixaAtual && caixaAtual.valorFechamento == null && valorFechamentoInput.trim() !== "") {
        const res = await fetch(`/api/caixa/${caixaAtual.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ valorFechamento: valorFechamentoInput }),
        });
        if (res.ok) caixaAtual = await res.json();
      }

      const saldo = (caixaAtual?.valorAbertura ?? 0) + relatorio.resultado;

      setFechamentoImpressao({
        data: todayStr(),
        caixa: caixaAtual,
        totalCompras: relatorio.totalCompras,
        totalVendas: relatorio.totalVendas,
        totalGastos: relatorio.totalGastos,
        saldo,
        quantidadeCompras: relatorio.quantidadeCompras,
        quantidadeVendas: relatorio.quantidadeVendas,
        porProduto: relatorio.porProduto,
        estoqueAtual: relatorio.estoqueAtual,
      });
      imprimirRecibo();
      await loadCaixaHoje();
    } finally {
      setFechando(false);
    }
  }

  return (
    <div>
      <PageTitle
        title="Relatórios"
        subtitle="Compras, vendas e estoque por período"
        action={
          <button onClick={imprimir} className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 print:hidden">
            Imprimir relatório
          </button>
        }
      />

      <Card className="mb-6 print:hidden">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="De">
            <Input type="date" value={de} onChange={(e) => setDe(e.target.value)} />
          </Field>
          <Field label="Até">
            <Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
          </Field>
        </div>
      </Card>

      {ehHoje && relatorio && (
        <Card className="mb-6 print:hidden">
          <h2 className="mb-1 text-sm font-semibold text-slate-700">Fechamento do expediente (hoje)</h2>
          {!caixaHoje?.caixa && (
            <p className="mb-3 text-sm text-slate-500">
              O caixa de hoje ainda não foi aberto (abra em <strong>Financeiro</strong> se quiser registrar
              abertura/fechamento). Você ainda pode imprimir o relatório do dia na impressora térmica de 80mm.
            </p>
          )}
          {caixaHoje?.caixa?.valorFechamento != null && (
            <p className="mb-3 text-sm text-slate-500">
              O caixa de hoje já foi fechado com R$ {caixaHoje.caixa.valorFechamento.toFixed(2)}. Você pode
              reimprimir o relatório de fechamento sempre que precisar.
            </p>
          )}
          <div className="flex flex-wrap items-end gap-3">
            {caixaHoje?.caixa && caixaHoje.caixa.valorFechamento == null && (
              <Field label="Valor de fechamento (contagem do caixa)">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorFechamentoInput}
                  onChange={(e) => setValorFechamentoInput(e.target.value)}
                  className="w-48"
                />
              </Field>
            )}
            <Button onClick={fecharEImprimir} disabled={fechando}>
              {caixaHoje?.caixa && caixaHoje.caixa.valorFechamento == null
                ? "Fechar caixa e imprimir (80mm)"
                : "Imprimir relatório do dia (80mm)"}
            </Button>
            {caixaHoje?.caixa && (
              <span className="text-sm text-slate-500">Saldo calculado: R$ {caixaHoje.saldo.toFixed(2)}</span>
            )}
          </div>
        </Card>
      )}

      {relatorio && (
        <div id="relatorio-impressao">
          <p className="mb-4 hidden text-sm text-slate-600 print:block">
            Período: {de} a {ate} — Sucatas Alumínio
          </p>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <p className="text-sm text-slate-500">Compras no período ({relatorio.quantidadeCompras})</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">R$ {relatorio.totalCompras.toFixed(2)}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Vendas no período ({relatorio.quantidadeVendas})</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">R$ {relatorio.totalVendas.toFixed(2)}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Gastos no período</p>
              <p className="mt-1 text-2xl font-bold text-red-700">R$ {relatorio.totalGastos.toFixed(2)}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Resultado (vendas − compras − gastos)</p>
              <p className={`mt-1 text-2xl font-bold ${relatorio.resultado >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                R$ {relatorio.resultado.toFixed(2)}
              </p>
            </Card>
          </div>

          <Card className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Movimentação por produto no período</h2>
            <Table headers={["Produto", "Comprado", "Valor comprado", "Vendido", "Valor vendido"]}>
              {relatorio.porProduto.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState message="Nenhuma movimentação no período selecionado." />
                  </td>
                </tr>
              )}
              {relatorio.porProduto.map((p) => (
                <tr key={p.produtoId}>
                  <td className="px-3 py-2 font-medium">{p.nome}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {p.quantidadeComprada} {p.unidade === "KG" ? "kg" : "un"}
                  </td>
                  <td className="px-3 py-2 text-slate-600">R$ {p.valorComprado.toFixed(2)}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {p.quantidadeVendida} {p.unidade === "KG" ? "kg" : "un"}
                  </td>
                  <td className="px-3 py-2 text-slate-600">R$ {p.valorVendido.toFixed(2)}</td>
                </tr>
              ))}
            </Table>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Estoque atual (posição no momento da geração)</h2>
            <Table headers={["Produto", "Estoque atual", "Estoque mínimo", "Situação"]}>
              {relatorio.estoqueAtual.map((p) => {
                const baixo = p.estoqueAtual <= p.estoqueMinimo;
                return (
                  <tr key={p.nome}>
                    <td className="px-3 py-2 font-medium">{p.nome}</td>
                    <td className={`px-3 py-2 ${baixo ? "font-semibold text-red-600" : "text-slate-800"}`}>
                      {p.estoqueAtual} {p.unidade === "KG" ? "kg" : "un"}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {p.estoqueMinimo} {p.unidade === "KG" ? "kg" : "un"}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{baixo ? "Estoque baixo" : "Normal"}</td>
                  </tr>
                );
              })}
            </Table>
          </Card>
        </div>
      )}

      {!loading && !relatorio && <EmptyState message="Selecione um período para gerar o relatório." />}

      <ComandaFechamento fechamento={fechamentoImpressao} />
    </div>
  );
}
