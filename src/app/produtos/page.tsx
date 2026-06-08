"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, EmptyState, Field, Input, PageTitle, Select, Table } from "@/components/ui";

type Produto = {
  id: string;
  nome: string;
  unidade: "KG" | "UNIDADE";
  valorUnitario: number;
  estoqueAtual: number;
  estoqueMinimo: number;
};

const emptyForm = { nome: "", unidade: "KG", valorUnitario: "", estoqueAtual: "0", estoqueMinimo: "0" };

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/produtos");
    setProdutos(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(produto: Produto) {
    setEditingId(produto.id);
    setForm({
      nome: produto.nome,
      unidade: produto.unidade,
      valorUnitario: String(produto.valorUnitario),
      estoqueAtual: String(produto.estoqueAtual),
      estoqueMinimo: String(produto.estoqueMinimo),
    });
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
        await fetch(`/api/produtos/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/produtos", {
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
    if (!confirm("Excluir este produto?")) return;
    await fetch(`/api/produtos/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageTitle
        title="Produtos"
        subtitle="Cadastro de materiais (sucata) com valor por kg/unidade e controle de estoque"
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Nome *">
            <Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Field>
          <Field label="Unidade">
            <Select value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })}>
              <option value="KG">Quilo (kg)</option>
              <option value="UNIDADE">Unidade</option>
            </Select>
          </Field>
          <Field label="Valor por kg/unidade (R$) *">
            <Input
              required
              type="number"
              step="0.01"
              min="0"
              value={form.valorUnitario}
              onChange={(e) => setForm({ ...form, valorUnitario: e.target.value })}
            />
          </Field>
          <Field label="Estoque atual">
            <Input
              type="number"
              step="0.01"
              value={form.estoqueAtual}
              onChange={(e) => setForm({ ...form, estoqueAtual: e.target.value })}
            />
          </Field>
          <Field label="Estoque mínimo (alerta)">
            <Input
              type="number"
              step="0.01"
              value={form.estoqueMinimo}
              onChange={(e) => setForm({ ...form, estoqueMinimo: e.target.value })}
            />
          </Field>
          <div className="flex items-end gap-2 lg:col-span-5">
            <Button type="submit" disabled={loading}>
              {editingId ? "Salvar alterações" : "Adicionar produto"}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <Table headers={["Produto", "Unidade", "Valor", "Estoque atual", "Estoque mínimo", ""]}>
          {produtos.length === 0 && (
            <tr>
              <td colSpan={6}>
                <EmptyState message="Nenhum produto cadastrado ainda." />
              </td>
            </tr>
          )}
          {produtos.map((produto) => {
            const baixo = produto.estoqueAtual <= produto.estoqueMinimo;
            return (
              <tr key={produto.id}>
                <td className="px-3 py-2 font-medium">{produto.nome}</td>
                <td className="px-3 py-2 text-slate-600">{produto.unidade === "KG" ? "kg" : "unidade"}</td>
                <td className="px-3 py-2 text-slate-600">
                  R$ {produto.valorUnitario.toFixed(2)} / {produto.unidade === "KG" ? "kg" : "un"}
                </td>
                <td className="px-3 py-2">
                  <span className={baixo ? "font-semibold text-red-600" : "text-slate-800"}>
                    {produto.estoqueAtual} {produto.unidade === "KG" ? "kg" : "un"}
                  </span>
                  {baixo && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Estoque baixo
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {produto.estoqueMinimo} {produto.unidade === "KG" ? "kg" : "un"}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => startEdit(produto)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(produto.id)}>
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
