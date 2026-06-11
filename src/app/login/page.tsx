"use client";

import Image from "next/image";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, senha }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErro(typeof data?.error === "string" ? data.error : "Não foi possível entrar. Tente novamente.");
        return;
      }

      const destino = searchParams.get("redirect") || "/";
      router.replace(destino);
      router.refresh();
    } catch {
      setErro("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "#F4F6F3" }}>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="relative h-28 w-28">
            <Image src="/logo.png" alt="Sucatas Alumínio" fill className="object-contain" priority />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: "#1A6B1A" }}>Sucatas Alumínio</p>
            <p className="mt-0.5 text-sm text-slate-500">Entre para acessar o sistema</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="login" className="mb-1.5 block text-sm font-medium text-slate-700">
                Usuário
              </label>
              <input
                id="login"
                name="login"
                type="text"
                autoComplete="username"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#1A6B1A40" } as React.CSSProperties}
                onFocus={(e) => { e.target.style.borderColor = "#1A6B1A"; }}
                onBlur={(e) => { e.target.style.borderColor = "#CBD5E1"; }}
              />
            </div>

            <div>
              <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-slate-700">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2"
                onFocus={(e) => { e.target.style.borderColor = "#1A6B1A"; }}
                onBlur={(e) => { e.target.style.borderColor = "#CBD5E1"; }}
              />
            </div>

            {erro && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="mt-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: carregando ? "#145214" : "#1A6B1A" }}
              onMouseEnter={(e) => { if (!carregando) (e.currentTarget as HTMLElement).style.background = "#145214"; }}
              onMouseLeave={(e) => { if (!carregando) (e.currentTarget as HTMLElement).style.background = "#1A6B1A"; }}
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
