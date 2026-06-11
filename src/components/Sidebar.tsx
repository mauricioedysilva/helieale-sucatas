"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart2,
  DollarSign,
  Home,
  List,
  LogOut,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Tag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

const links = [
  { href: "/",              label: "Início",        Icon: Home },
  { href: "/pedidos",       label: "Pedidos",       Icon: List },
  { href: "/compras",       label: "Compras",       Icon: TrendingDown },
  { href: "/vendas",        label: "Vendas",        Icon: TrendingUp },
  { href: "/estoque",       label: "Estoque",       Icon: Package },
  { href: "/produtos",      label: "Produtos",      Icon: Tag },
  { href: "/clientes",      label: "Clientes",      Icon: Users },
  { href: "/financeiro",    label: "Financeiro",    Icon: DollarSign },
  { href: "/gastos",        label: "Gastos",        Icon: Receipt },
  { href: "/colaboradores", label: "Colaboradores", Icon: ShoppingCart },
  { href: "/relatorios",    label: "Relatórios",    Icon: BarChart2 },
  { href: "/configuracoes", label: "Configurações", Icon: Settings },
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
    <aside className="flex w-56 shrink-0 flex-col print:hidden" style={{ background: "#1A6B1A" }}>
      <div className="flex flex-col items-center gap-2 border-b px-4 py-5" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
        <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white/20 bg-white/10">
          <Image
            src="/logo.png"
            alt="Sucatas Alumínio"
            fill
            className="object-contain p-1"
            priority
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-white">Sucatas Alumínio</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Sistema de gestão</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {links.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all"
              style={
                active
                  ? { background: "#F5C200", color: "#1A3A00" }
                  : { color: "rgba(255,255,255,0.75)" }
              }
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon size={16} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
        <button
          type="button"
          onClick={handleLogout}
          disabled={saindo}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
          style={{ color: "rgba(255,255,255,0.6)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <LogOut size={16} aria-hidden />
          {saindo ? "Saindo..." : "Sair"}
        </button>
      </div>
    </aside>
  );
}
