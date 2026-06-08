"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, EmptyState, Field, Input, PageTitle, Table } from "@/components/ui";

type Empresa = {
  id: string;
  nome: string;
  cnpj: string | null;
  endereco: string | null;
  responsavel: string | null;
};

const emptyForm = { nome: "", cnpj: "", endereco: "", responsavel: "" };

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/empresas");
    setEmpresas(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(empresa: Empresa) {
    setEditingId(empresa.id);
    setForm({
      nome: empresa.nome,
      cnpj: empresa.cnpj ?? "",
      endereco: empresa.endereco ?? "",
      responsavel: empresa.responsavel ?? "",
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
        await fetch(`/api/empresas/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/empresas", {
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
    if (!confirm("Excluir esta empresa?")) return;
    await fetch(`/api/empresas/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageTitle title="Empresas" subtitle="Cadastro de empresas relacionadas ao negócio" />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Nome *">
            <Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Field>
          <Field label="CNPJ">
            <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
          </Field>
          <Field label="Endereço">
            <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          </Field>
          <Field label="Responsável">
            <Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
          </Field>
          <div className="flex items-end gap-2 lg:col-span-4">
            <Button type="submit" disabled={loading}>
              {editingId ? "Salvar alterações" : "Adicionar empresa"}
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
        <Table headers={["Nome", "CNPJ", "Endereço", "Responsável", ""]}>
          {empresas.length === 0 && (
            <tr>
              <td colSpan={5}>
                <EmptyState message="Nenhuma empresa cadastrada ainda." />
              </td>
            </tr>
          )}
          {empresas.map((empresa) => (
            <tr key={empresa.id}>
              <td className="px-3 py-2 font-medium">{empresa.nome}</td>
              <td className="px-3 py-2 text-slate-600">{empresa.cnpj || "—"}</td>
              <td className="px-3 py-2 text-slate-600">{empresa.endereco || "—"}</td>
              <td className="px-3 py-2 text-slate-600">{empresa.responsavel || "—"}</td>
              <td className="px-3 py-2 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => startEdit(empresa)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(empresa.id)}>
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
