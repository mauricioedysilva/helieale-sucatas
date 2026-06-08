"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { ClienteSeletor, type ClienteResumo } from "@/components/ClienteSeletor";

type Cliente = ClienteResumo;
type Produto = { id: string; nome: string; unidade: "KG" | "UNIDADE"; valorUnitario: number; estoqueAtual: number };
type FormaPagamento = { id: string; nome: string };

type ItemForm = { produtoId: string; quantidade: string; valorUnitario: string };

const emptyItem: ItemForm = { produtoId: "", quantidade: "", valorUnitario: "" };

export function PedidoForm({
  tipo,
  onCreated,
}: {
  tipo: "COMPRA" | "VENDA";
  onCreated?: () => void;
}) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [formaPagamentoId, setFormaPagamentoId] = useState("");
  const [observacao, setObservacao] = useState("");
  const [itens, setItens] = useState<ItemForm[]>([{ ...emptyItem }]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/clientes").then((r) => r.json()).then(setClientes);
    fetch("/api/produtos").then((r) => r.json()).then(setProdutos);
    fetch("/api/formas-pagamento").then((r) => r.json()).then(setFormas);
  }, []);

  function updateItem(index: number, patch: Partial<ItemForm>) {
    setItens((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function handleProdutoChange(index: number, produtoId: string) {
    const produto = produtos.find((p) => p.id === produtoId);
    updateItem(index, { produtoId, valorUnitario: produto ? String(produto.valorUnitario) : "" });
  }

  function addItem() {
    setItens((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    setItens((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function subtotalOf(item: ItemForm) {
    const q = parseFloat(item.quantidade);
    const v = parseFloat(item.valorUnitario);
    if (Number.isNaN(q) || Number.isNaN(v)) return 0;
    return q * v;
  }

  const total = itens.reduce((acc, item) => acc + subtotalOf(item), 0);

  function resetForm() {
    setClienteId("");
    setFormaPagamentoId("");
    setObservacao("");
    setItens([{ ...emptyItem }]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    const itensValidos = itens.filter((i) => i.produtoId && i.quantidade && i.valorUnitario);
    if (itensValidos.length === 0) {
      setErro("Inclua ao menos um item com produto, quantidade e valor.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          clienteId: clienteId || null,
          formaPagamentoId: formaPagamentoId || null,
          observacao,
          itens: itensValidos.map((i) => ({
            produtoId: i.produtoId,
            quantidade: Number(i.quantidade),
            valorUnitario: Number(i.valorUnitario),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErro(data.error || "Não foi possível registrar o pedido.");
        return;
      }

      setSucesso(tipo === "COMPRA" ? "Compra registrada com sucesso!" : "Venda registrada com sucesso!");
      resetForm();
      // refresh local product list (estoque atualizado)
      fetch("/api/produtos").then((r) => r.json()).then(setProdutos);
      onCreated?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ClienteSeletor
            label={tipo === "COMPRA" ? "Cliente / vendedor (opcional)" : "Cliente comprador (opcional)"}
            clientes={clientes}
            value={clienteId}
            onChange={setClienteId}
          />
          <Field label="Forma de pagamento">
            <Select value={formaPagamentoId} onChange={(e) => setFormaPagamentoId(e.target.value)}>
              <option value="">— Selecionar —</option>
              {formas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Itens do pedido</p>
          <div className="flex flex-col gap-3">
            {itens.map((item, index) => {
              const produto = produtos.find((p) => p.id === item.produtoId);
              return (
                <div key={index} className="grid grid-cols-1 gap-2 rounded-md border border-slate-200 p-3 sm:grid-cols-12 sm:items-end">
                  <div className="sm:col-span-5">
                    <Field label="Produto">
                      <Select value={item.produtoId} onChange={(e) => handleProdutoChange(index, e.target.value)}>
                        <option value="">— Selecionar —</option>
                        {produtos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} ({p.unidade === "KG" ? "kg" : "un"}) — estoque: {p.estoqueAtual}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label={`Qtd. ${produto ? (produto.unidade === "KG" ? "(kg)" : "(un)") : ""}`}>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.quantidade}
                        onChange={(e) => updateItem(index, { quantidade: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Valor unitário (R$)">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.valorUnitario}
                        onChange={(e) => updateItem(index, { valorUnitario: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-slate-500">Subtotal</p>
                    <p className="text-sm font-semibold text-slate-800">R$ {subtotalOf(item).toFixed(2)}</p>
                  </div>
                  <div className="sm:col-span-1">
                    <Button type="button" variant="danger" onClick={() => removeItem(index)} disabled={itens.length === 1}>
                      Remover
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <Button type="button" variant="secondary" className="mt-3" onClick={addItem}>
            + Adicionar item
          </Button>
        </div>

        <Field label="Observação (opcional)">
          <Textarea rows={2} value={observacao} onChange={(e) => setObservacao(e.target.value)} />
        </Field>

        <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3">
          <span className="text-sm font-medium text-slate-600">Valor total do pedido</span>
          <span className="text-xl font-bold text-slate-900">R$ {total.toFixed(2)}</span>
        </div>

        {erro && <p className="text-sm font-medium text-red-600">{erro}</p>}
        {sucesso && <p className="text-sm font-medium text-emerald-600">{sucesso}</p>}

        <div>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : tipo === "COMPRA" ? "Registrar compra" : "Registrar venda"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
