"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Field, Input } from "@/components/ui";

export type ClienteResumo = {
  id: string;
  nome: string;
  celular: string | null;
  cpf: string | null;
  cnpj: string | null;
};

function normalizar(valor: string) {
  return valor.toLowerCase().trim();
}

/** Mantém apenas dígitos — útil para comparar celular/CPF/CNPJ ignorando formatação. */
function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

function clienteCorresponde(cliente: ClienteResumo, termo: string) {
  const termoNormalizado = normalizar(termo);
  if (!termoNormalizado) return true;

  if (normalizar(cliente.nome).includes(termoNormalizado)) return true;

  const termoDigitos = apenasDigitos(termo);
  if (termoDigitos.length >= 3) {
    if (cliente.celular && apenasDigitos(cliente.celular).includes(termoDigitos)) return true;
    if (cliente.cpf && apenasDigitos(cliente.cpf).includes(termoDigitos)) return true;
    if (cliente.cnpj && apenasDigitos(cliente.cnpj).includes(termoDigitos)) return true;
  }

  return false;
}

function descricaoCliente(cliente: ClienteResumo) {
  const partes: string[] = [];
  if (cliente.celular) partes.push(`Cel: ${cliente.celular}`);
  if (cliente.cpf) partes.push(`CPF: ${cliente.cpf}`);
  if (cliente.cnpj) partes.push(`CNPJ: ${cliente.cnpj}`);
  return partes.join(" • ");
}

export function ClienteSeletor({
  label,
  clientes,
  value,
  onChange,
}: {
  label: string;
  clientes: ClienteResumo[];
  value: string;
  onChange: (clienteId: string) => void;
}) {
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const clienteSelecionado = useMemo(() => clientes.find((c) => c.id === value) ?? null, [clientes, value]);

  // Quando o cliente selecionado muda externamente (ex.: reset do formulário), sincroniza o texto exibido.
  useEffect(() => {
    if (!aberto) {
      setTermo(clienteSelecionado ? clienteSelecionado.nome : "");
    }
  }, [clienteSelecionado, aberto]);

  useEffect(() => {
    function handleClickFora(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const resultados = useMemo(() => {
    if (!aberto) return [];
    return clientes.filter((c) => clienteCorresponde(c, termo)).slice(0, 30);
  }, [clientes, termo, aberto]);

  function selecionar(cliente: ClienteResumo | null) {
    onChange(cliente?.id ?? "");
    setTermo(cliente?.nome ?? "");
    setAberto(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <Field label={label}>
        <Input
          value={termo}
          onChange={(e) => {
            setTermo(e.target.value);
            setAberto(true);
            if (value) onChange(""); // limpa seleção anterior ao começar a digitar de novo
          }}
          onFocus={() => setAberto(true)}
          placeholder="Busque por nome, celular, CPF ou CNPJ..."
          autoComplete="off"
        />
      </Field>

      {aberto && (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => selecionar(null)}
            className="flex w-full flex-col gap-0.5 border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50"
          >
            — Não informado —
          </button>
          {resultados.length === 0 && (
            <p className="px-3 py-3 text-sm text-slate-500">
              {termo.trim() ? "Nenhum cliente encontrado para essa busca." : "Nenhum cliente cadastrado ainda."}
            </p>
          )}
          {resultados.map((cliente) => (
            <button
              key={cliente.id}
              type="button"
              onClick={() => selecionar(cliente)}
              className="flex w-full flex-col gap-0.5 border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">{cliente.nome}</span>
              {descricaoCliente(cliente) && <span className="text-xs text-slate-500">{descricaoCliente(cliente)}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
