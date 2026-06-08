"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, EmptyState, Field, Input, PageTitle, Table } from "@/components/ui";

type FormaPagamento = { id: string; nome: string };

export default function ConfiguracoesPage() {
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/formas-pagamento");
    setFormas(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/formas-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim() }),
      });
      setNome("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta forma de pagamento?")) return;
    await fetch(`/api/formas-pagamento/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageTitle title="Configurações" subtitle="Formas de pagamento exibidas ao finalizar Compras e Vendas" />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <Field label="Nova forma de pagamento">
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Transferência" />
          </Field>
          <Button type="submit" disabled={loading}>
            Adicionar
          </Button>
        </form>
      </Card>

      <Card>
        <Table headers={["Forma de pagamento", ""]}>
          {formas.length === 0 && (
            <tr>
              <td colSpan={2}>
                <EmptyState message="Nenhuma forma de pagamento cadastrada." />
              </td>
            </tr>
          )}
          {formas.map((forma) => (
            <tr key={forma.id}>
              <td className="px-3 py-2 font-medium">{forma.nome}</td>
              <td className="px-3 py-2 text-right">
                <Button variant="danger" onClick={() => handleDelete(forma.id)}>
                  Remover
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
