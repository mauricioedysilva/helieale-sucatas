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

function ImpressaoAutomaticaCard() {
  const [ativa, setAtiva] = useState(false);
  const [urlSistema, setUrlSistema] = useState("");

  useEffect(() => {
    setAtiva(localStorage.getItem("impressao-automatica") === "ativa");
    setUrlSistema(window.location.origin);
  }, []);

  function toggle() {
    const novo = !ativa;
    setAtiva(novo);
    if (novo) localStorage.setItem("impressao-automatica", "ativa");
    else localStorage.removeItem("impressao-automatica");
  }

  const atalho = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --kiosk-printing --app=${urlSistema}`;

  return (
    <Card className="mb-6">
      <h2 className="mb-1 text-base font-semibold text-slate-800">Impressão Automática</h2>
      <p className="mb-4 text-sm text-slate-500">
        Quando ativado, a comanda é impressa automaticamente ao registrar uma compra ou venda — sem precisar clicar em "Imprimir comanda".
      </p>

      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${ativa ? "bg-[#1A6B1A]" : "bg-slate-300"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${ativa ? "translate-x-6" : "translate-x-1"}`} />
        </button>
        <span className="text-sm font-medium text-slate-700">{ativa ? "Ativado neste dispositivo" : "Desativado"}</span>
      </div>

      {ativa && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-semibold text-amber-800">Para imprimir sem o diálogo do navegador, siga estes passos uma única vez:</p>
          <ol className="space-y-1 pl-4 text-sm text-amber-700" style={{ listStyleType: "decimal" }}>
            <li>Clique com o botão direito na área de trabalho → <strong>Novo → Atalho</strong></li>
            <li>Cole o caminho abaixo no campo de local e clique em <strong>Avançar</strong>:</li>
          </ol>
          <div className="my-2 select-all break-all rounded border border-amber-200 bg-white p-2 font-mono text-xs text-slate-700">
            {atalho}
          </div>
          <ol className="space-y-1 pl-4 text-sm text-amber-700" style={{ listStyleType: "decimal" }} start={3}>
            <li>Dê o nome <strong>Sucatas Alumínio</strong> e clique em <strong>Concluir</strong></li>
            <li>Use <strong>sempre esse atalho</strong> para abrir o sistema</li>
            <li>Defina sua impressora térmica como <strong>impressora padrão</strong> no Windows</li>
          </ol>
          <p className="mt-3 text-xs text-amber-600">
            Esta configuração é salva neste dispositivo. Cada computador precisa ativar separadamente.
          </p>
        </div>
      )}
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
      <ImpressaoAutomaticaCard />

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
