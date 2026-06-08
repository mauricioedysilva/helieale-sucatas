"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Início" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/compras", label: "Compras" },
  { href: "/vendas", label: "Vendas" },
  { href: "/estoque", label: "Estoque" },
  { href: "/produtos", label: "Produtos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/empresas", label: "Empresas" },
  { href: "/financeiro", label: "Financeiro" },
  { href: "/gastos", label: "Gastos" },
  { href: "/colaboradores", label: "Colaboradores" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/configuracoes", label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-slate-50 print:hidden">
      <div className="px-4 py-5 border-b border-slate-200">
        <p className="text-lg font-bold text-slate-800">HelieAle Sucatas</p>
        <p className="text-xs text-slate-500">Sistema de gestão</p>
      </div>
      <nav className="flex flex-col gap-1 p-3">
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
    </aside>
  );
}
