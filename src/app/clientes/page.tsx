"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, EmptyState, Field, Input, PageTitle, Table } from "@/components/ui";

type Cliente = {
  id: string;
  nome: string;
  celular: string | null;
  endereco: string | null;
  cpf: string | null;
};

const emptyForm = { nome: "", celular: "", endereco: "", cpf: "" };

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/clientes");
    setClientes(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(cliente: Cliente) {
    setEditingId(cliente.id);
    setForm({
      nome: cliente.nome,
      celular: cliente.celular ?? "",
      endereco: cliente.endereco ?? "",
      cpf: cliente.cpf ?? "",
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
        await fetch(`/api/clientes/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/clientes", {
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
    if (!confirm("Excluir este cliente?")) return;
    await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageTitle title="Clientes" subtitle="Cadastro de clientes do ferro velho" />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Nome *">
            <Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Field>
          <Field label="Celular">
            <Input value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} />
          </Field>
          <Field label="Endereço (opcional)">
            <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          </Field>
          <Field label="CPF (opcional)">
            <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
          </Field>
          <div className="flex items-end gap-2 lg:col-span-4">
            <Button type="submit" disabled={loading}>
              {editingId ? "Salvar alterações" : "Adicionar cliente"}
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
        <Table headers={["Nome", "Celular", "Endereço", "CPF", ""]}>
          {clientes.length === 0 && (
            <tr>
              <td colSpan={5}>
                <EmptyState message="Nenhum cliente cadastrado ainda." />
              </td>
            </tr>
          )}
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td className="px-3 py-2 font-medium">{cliente.nome}</td>
              <td className="px-3 py-2 text-slate-600">{cliente.celular || "—"}</td>
              <td className="px-3 py-2 text-slate-600">{cliente.endereco || "—"}</td>
              <td className="px-3 py-2 text-slate-600">{cliente.cpf || "—"}</td>
              <td className="px-3 py-2 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => startEdit(cliente)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(cliente.id)}>
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
