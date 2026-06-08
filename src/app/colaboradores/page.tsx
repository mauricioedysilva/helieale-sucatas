"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, EmptyState, Field, Input, PageTitle, Table } from "@/components/ui";

type Lancamento = { id: string; valor: number; data: string; motivo?: string | null };
type Colaborador = {
  id: string;
  nome: string;
  salario: number;
  vales: Lancamento[];
  descontos: Lancamento[];
};

const emptyForm = { nome: "", salario: "" };
const emptyLancamento = { valor: "", motivo: "" };

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [valeForm, setValeForm] = useState(emptyLancamento);
  const [descontoForm, setDescontoForm] = useState(emptyLancamento);

  async function load() {
    const res = await fetch("/api/colaboradores");
    setColaboradores(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(colaborador: Colaborador) {
    setEditingId(colaborador.id);
    setForm({ nome: colaborador.nome, salario: String(colaborador.salario) });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await fetch(`/api/colaboradores/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/colaboradores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      cancelEdit();
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este colaborador?")) return;
    await fetch(`/api/colaboradores/${id}`, { method: "DELETE" });
    await load();
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
    setValeForm(emptyLancamento);
    setDescontoForm(emptyLancamento);
  }

  async function addVale(e: FormEvent, colaboradorId: string) {
    e.preventDefault();
    if (!valeForm.valor) return;
    await fetch(`/api/colaboradores/${colaboradorId}/vales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor: valeForm.valor }),
    });
    setValeForm(emptyLancamento);
    await load();
  }

  async function addDesconto(e: FormEvent, colaboradorId: string) {
    e.preventDefault();
    if (!descontoForm.valor) return;
    await fetch(`/api/colaboradores/${colaboradorId}/descontos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor: descontoForm.valor, motivo: descontoForm.motivo }),
    });
    setDescontoForm(emptyLancamento);
    await load();
  }

  async function removeVale(id: string) {
    await fetch(`/api/vales/${id}`, { method: "DELETE" });
    await load();
  }

  async function removeDesconto(id: string) {
    await fetch(`/api/descontos/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageTitle title="Colaboradores" subtitle="Cadastro de funcionários, salários, vales e descontos" />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nome *">
            <Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Field>
          <Field label="Salário (R$) *">
            <Input
              required
              type="number"
              step="0.01"
              min="0"
              value={form.salario}
              onChange={(e) => setForm({ ...form, salario: e.target.value })}
            />
          </Field>
          <div className="flex items-end gap-2">
            <Button type="submit" disabled={loading}>
              {editingId ? "Salvar alterações" : "Adicionar colaborador"}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {colaboradores.length === 0 && (
          <Card>
            <EmptyState message="Nenhum colaborador cadastrado ainda." />
          </Card>
        )}
        {colaboradores.map((colaborador) => {
          const totalVales = colaborador.vales.reduce((acc, v) => acc + v.valor, 0);
          const totalDescontos = colaborador.descontos.reduce((acc, d) => acc + d.valor, 0);
          const liquido = colaborador.salario - totalVales - totalDescontos;
          const expanded = expandedId === colaborador.id;

          return (
            <Card key={colaborador.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{colaborador.nome}</p>
                  <p className="text-sm text-slate-500">
                    Salário: R$ {colaborador.salario.toFixed(2)} · Vales no período: R$ {totalVales.toFixed(2)} ·
                    Descontos: R$ {totalDescontos.toFixed(2)} · <span className="font-medium text-slate-700">Líquido estimado: R$ {liquido.toFixed(2)}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => toggleExpand(colaborador.id)}>
                    {expanded ? "Fechar" : "Vales / Descontos"}
                  </Button>
                  <Button variant="secondary" onClick={() => startEdit(colaborador)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(colaborador.id)}>
                    Excluir
                  </Button>
                </div>
              </div>

              {expanded && (
                <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-slate-700">Vales</h3>
                    <form onSubmit={(e) => addVale(e, colaborador.id)} className="mb-3 flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Valor (R$)"
                        value={valeForm.valor}
                        onChange={(e) => setValeForm({ ...valeForm, valor: e.target.value })}
                      />
                      <Button type="submit">Adicionar</Button>
                    </form>
                    <ul className="flex flex-col gap-1 text-sm">
                      {colaborador.vales.length === 0 && <li className="text-slate-400">Nenhum vale lançado.</li>}
                      {colaborador.vales.map((v) => (
                        <li key={v.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5">
                          <span>
                            R$ {v.valor.toFixed(2)} — {new Date(v.data).toLocaleDateString("pt-BR")}
                          </span>
                          <button onClick={() => removeVale(v.id)} className="text-xs text-red-600 hover:underline">
                            remover
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-slate-700">Descontos</h3>
                    <form onSubmit={(e) => addDesconto(e, colaborador.id)} className="mb-3 flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Valor (R$)"
                        value={descontoForm.valor}
                        onChange={(e) => setDescontoForm({ ...descontoForm, valor: e.target.value })}
                      />
                      <Input
                        placeholder="Motivo (opcional)"
                        value={descontoForm.motivo}
                        onChange={(e) => setDescontoForm({ ...descontoForm, motivo: e.target.value })}
                      />
                      <Button type="submit">Adicionar</Button>
                    </form>
                    <ul className="flex flex-col gap-1 text-sm">
                      {colaborador.descontos.length === 0 && <li className="text-slate-400">Nenhum desconto lançado.</li>}
                      {colaborador.descontos.map((d) => (
                        <li key={d.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5">
                          <span>
                            R$ {d.valor.toFixed(2)}
                            {d.motivo ? ` — ${d.motivo}` : ""} — {new Date(d.data).toLocaleDateString("pt-BR")}
                          </span>
                          <button onClick={() => removeDesconto(d.id)} className="text-xs text-red-600 hover:underline">
                            remover
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
