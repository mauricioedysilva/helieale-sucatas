"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, EmptyState, Field, Input, PageTitle, Select, Table } from "@/components/ui";

type Produto = {
  id: string;
  nome: string;
  unidade: "KG" | "UNIDADE";
  valorUnitario: number;
  estoqueAtual: number;
};

const emptyForm = { nome: "", unidade: "KG", valorUnitario: "" };

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/produtos");
    setProdutos(await res.json());
  }

  useEffect(() => { load(); }, []);

  function startEdit(produto: Produto) {
    setEditingId(produto.id);
    setForm({
      nome: produto.nome,
      unidade: produto.unidade,
      valorUnitario: String(produto.valorUnitario),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setErro(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);
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
    setErro(null);
    const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error || "Não foi possível excluir o produto.");
      return;
    }
    await load();
  }

  return (
    <div>
      <PageTitle
        title="Produtos"
        subtitle="Cadastro de materiais — o estoque é atualizado automaticamente pelas Compras e Vendas"
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          <div className="flex items-end gap-2 sm:col-span-3">
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

      {erro && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <Card>
        <Table headers={["Produto", "Unidade", "Valor", "Estoque atual", "Situação", ""]}>
          {produtos.length === 0 && (
            <tr>
              <td colSpan={6}>
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
                <td className="px-3 py-2 text-slate-600">
                  R$ {produto.valorUnitario.toFixed(2)} / {produto.unidade === "KG" ? "kg" : "un"}
                </td>
                <td className="px-3 py-2 font-semibold" style={{ color: esgotado ? "#B03030" : "#1A6B1A" }}>
                  {produto.estoqueAtual} {produto.unidade === "KG" ? "kg" : "un"}
                </td>
                <td className="px-3 py-2">
                  {esgotado ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Sem estoque</span>
                  ) : (
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "#DFF0D8", color: "#1A6B1A" }}>Disponível</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => startEdit(produto)}>Editar</Button>
                    <Button variant="danger" onClick={() => handleDelete(produto.id)}>Excluir</Button>
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
