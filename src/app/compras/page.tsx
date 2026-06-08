"use client";

import { useState } from "react";
import { PageTitle } from "@/components/ui";
import { PedidoForm } from "@/components/PedidoForm";
import { PedidoHistorico } from "@/components/PedidoHistorico";

export default function ComprasPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Compras"
        subtitle="Registro de materiais comprados de quem traz sucata para vender — atualiza estoque e caixa automaticamente"
      />
      <PedidoForm tipo="COMPRA" onCreated={() => setRefreshKey((k) => k + 1)} />
      <PedidoHistorico tipo="COMPRA" refreshKey={refreshKey} />
    </div>
  );
}
