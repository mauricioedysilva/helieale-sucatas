"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Field, Input, PageTitle } from "@/components/ui";

type Resumo = {
  caixa: { id: string; valorAbertura: number; valorFechamento: number | null } | null;
  totalCompras: number;
  totalVendas: number;
  totalGastos: number;
  saldo: number;
  data: string;
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function FinanceiroPage() {
  const [data, setData] = useState(todayStr());
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [valorAbertura, setValorAbertura] = useState("");
  const [valorFechamento, setValorFechamento] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/caixa?data=${data}`);
    const json: Resumo = await res.json();
    setResumo(json);
    setValorFechamento(json.caixa?.valorFechamento != null ? String(json.caixa.valorFechamento) : "");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  async function abrirCaixa(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const res = await fetch("/api/caixa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, valorAbertura }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErro(j.error || "Não foi possível abrir o caixa.");
        return;
      }
      setValorAbertura("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function fecharCaixa(e: FormEvent) {
    e.preventDefault();
    if (!resumo?.caixa) return;
    setLoading(true);
    try {
      await fetch(`/api/caixa/${resumo.caixa.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valorFechamento }),
      });
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageTitle title="Financeiro" subtitle="Caixa diário: abertura, totais de compras/vendas/gastos e saldo" />

      <Card className="mb-6">
        <Field label="Data">
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="max-w-xs" />
        </Field>
      </Card>

      {!resumo?.caixa && (
        <Card className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Abrir caixa do dia</h2>
          <form onSubmit={abrirCaixa} className="flex flex-wrap items-end gap-3">
            <Field label="Valor de abertura (R$)">
              <Input
                required
                type="number"
                step="0.01"
                min="0"
                value={valorAbertura}
                onChange={(e) => setValorAbertura(e.target.value)}
                className="w-48"
              />
            </Field>
            <Button type="submit" disabled={loading}>
              Abrir caixa
            </Button>
          </form>
          {erro && <p className="mt-2 text-sm font-medium text-red-600">{erro}</p>}
        </Card>
      )}

      {resumo && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <p className="text-sm text-slate-500">Abertura do caixa</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {resumo.caixa ? `R$ ${resumo.caixa.valorAbertura.toFixed(2)}` : "Caixa não aberto"}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Total de vendas (entrada)</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">R$ {resumo.totalVendas.toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Total de compras (saída)</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">R$ {resumo.totalCompras.toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Total de gastos (saída)</p>
            <p className="mt-1 text-2xl font-bold text-red-700">R$ {resumo.totalGastos.toFixed(2)}</p>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-2">
            <p className="text-sm text-slate-500">Saldo do caixa (abertura + vendas − compras − gastos)</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">R$ {resumo.saldo.toFixed(2)}</p>
          </Card>

          {resumo.caixa && (
            <Card className="sm:col-span-2 lg:col-span-3">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Fechamento do caixa</h2>
              <form onSubmit={fecharCaixa} className="flex flex-wrap items-end gap-3">
                <Field label="Valor de fechamento (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorFechamento}
                    onChange={(e) => setValorFechamento(e.target.value)}
                    className="w-48"
                  />
                </Field>
                <Button type="submit" disabled={loading}>
                  {resumo.caixa.valorFechamento != null ? "Atualizar fechamento" : "Fechar caixa"}
                </Button>
                <span className="text-sm text-slate-500">
                  Sugestão com base no saldo calculado: R$ {resumo.saldo.toFixed(2)}
                </span>
              </form>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
