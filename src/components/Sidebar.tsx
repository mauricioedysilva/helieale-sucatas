"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Início" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/compras", label: "Compras" },
  { href: "/vendas", label: "Vendas" },
  { href: "/estoque", label: "Estoque" },
  { href: "/produtos", label: "Produtos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/financeiro", label: "Financeiro" },
  { href: "/gastos", label: "Gastos" },
  { href: "/colaboradores", label: "Colaboradores" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/configuracoes", label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function handleLogout() {
    if (saindo) return;
    setSaindo(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // mesmo se a chamada falhar, seguimos para a tela de login
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-50 print:hidden">
      <div className="px-4 py-5 border-b border-slate-200">
        <p className="text-lg font-bold text-slate-800">HelieAle Sucatas</p>
        <p className="text-xs text-slate-500">Sistema de gestão</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-emerald-600 text-white"
                  : "text-slate-700 hover:bg-slate-200"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={saindo}
          className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saindo ? "Saindo..." : "Sair"}
        </button>
      </div>
    </aside>
  );
}
