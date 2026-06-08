"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, EmptyState, Field, Input, PageTitle, Table } from "@/components/ui";

type FormaPagamento = { id: string; nome: string };

function TrocarSenhaCard() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "sucesso"; texto: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMensagem(null);

    if (novaSenha !== confirmarSenha) {
      setMensagem({ tipo: "erro", texto: "A confirmação não confere com a nova senha." });
      return;
    }
    if (novaSenha.length < 6) {
      setMensagem({ tipo: "erro", texto: "A nova senha deve ter pelo menos 6 caracteres." });
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch("/api/usuarios/senha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMensagem({ tipo: "erro", texto: typeof data?.error === "string" ? data.error : "Não foi possível trocar a senha." });
        return;
      }

      setMensagem({ tipo: "sucesso", texto: "Senha alterada com sucesso! Use a nova senha no próximo login." });
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch {
      setMensagem({ tipo: "erro", texto: "Não foi possível conectar ao servidor. Tente novamente." });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card className="mb-6">
      <h2 className="mb-1 text-base font-semibold text-slate-800">Trocar senha de acesso</h2>
      <p className="mb-4 text-sm text-slate-500">
        Defina uma nova senha para o seu usuário. Recomendado logo após a primeira instalação do sistema.
      </p>
      <form onSubmit={handleSubmit} className="grid gap-3 sm:max-w-sm">
        <Field label="Senha atual">
          <Input
            type="password"
            autoComplete="current-password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
          />
        </Field>
        <Field label="Nova senha">
          <Input
            type="password"
            autoComplete="new-password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
            minLength={6}
          />
        </Field>
        <Field label="Confirmar nova senha">
          <Input
            type="password"
            autoComplete="new-password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            minLength={6}
          />
        </Field>

        {mensagem && (
          <p className={`text-sm ${mensagem.tipo === "erro" ? "text-red-600" : "text-emerald-700"}`}>
            {mensagem.texto}
          </p>
        )}

        <div>
          <Button type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

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
      <PageTitle title="Configurações" subtitle="Formas de pagamento exibidas ao finalizar Compras e Vendas, e dados de acesso" />

      <TrocarSenhaCard />

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
