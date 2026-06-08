"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, EmptyState, Field, Input, PageTitle, Table } from "@/components/ui";

type Gasto = { id: string; nome: string; valor: number; data: string };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = { nome: "", valor: "", data: todayStr() };

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/gastos");
    setGastos(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este gasto?")) return;
    await fetch(`/api/gastos/${id}`, { method: "DELETE" });
    await load();
  }

  const totalGeral = gastos.reduce((acc, g) => acc + g.valor, 0);

  return (
    <div>
      <PageTitle title="Gastos" subtitle="Despesas do caixa: lanches, vales avulsos, manutenção etc." />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Nome do gasto *">
            <Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Field>
          <Field label="Valor (R$) *">
            <Input
              required
              type="number"
              step="0.01"
              min="0"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
            />
          </Field>
          <Field label="Data">
            <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          </Field>
          <div className="flex items-end">
            <Button type="submit" disabled={loading}>
              Adicionar gasto
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Gastos lançados</h2>
          <span className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-900">R$ {totalGeral.toFixed(2)}</span>
          </span>
        </div>
        <Table headers={["Data", "Gasto", "Valor", ""]}>
          {gastos.length === 0 && (
            <tr>
              <td colSpan={4}>
                <EmptyState message="Nenhum gasto lançado ainda." />
              </td>
            </tr>
          )}
          {gastos.map((gasto) => (
            <tr key={gasto.id}>
              <td className="px-3 py-2 text-slate-600">{new Date(gasto.data).toLocaleDateString("pt-BR")}</td>
              <td className="px-3 py-2 font-medium">{gasto.nome}</td>
              <td className="px-3 py-2 text-slate-800">R$ {gasto.valor.toFixed(2)}</td>
              <td className="px-3 py-2 text-right">
                <Button variant="danger" onClick={() => handleDelete(gasto.id)}>
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
