"use client";

import { useState } from "react";
import { PageTitle } from "@/components/ui";
import { PedidoForm } from "@/components/PedidoForm";
import { PedidoHistorico } from "@/components/PedidoHistorico";

export default function VendasPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Vendas"
        subtitle="Registro de materiais vendidos para clientes — atualiza estoque e caixa automaticamente"
      />
      <PedidoForm tipo="VENDA" onCreated={() => setRefreshKey((k) => k + 1)} />
      <PedidoHistorico tipo="VENDA" refreshKey={refreshKey} />
    </div>
  );
}
