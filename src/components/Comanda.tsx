"use client";

const TARA_LABEL: Record<string, string> = {
  BAG: "Bag (tara: −2 kg)",
  SACO: "Saco (tara: −100 g)",
};

export type PedidoParaImpressao = {
  id: string;
  tipo: "COMPRA" | "VENDA";
  data: string;
  valorTotal: number;
  observacao?: string | null;
  cliente: { nome: string } | null;
  formaPagamento: { nome: string } | null;
  itens: {
    id: string;
    quantidade: number;
    valorUnitario: number;
    subtotal: number;
    embalagem?: string | null;
    produto: { nome: string; unidade: "KG" | "UNIDADE" };
  }[];
};

export function Comanda({ pedido }: { pedido: PedidoParaImpressao | null }) {
  if (!pedido) return <div className="recibo-80mm" />;

  const dataFormatada = new Date(pedido.data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  return (
    <div className="recibo-80mm">
      <h2>Sucatas Alumínio</h2>
      <p style={{ textAlign: "center", margin: "0 0 2mm 0" }}>
        {pedido.tipo === "COMPRA" ? "COMPROVANTE DE COMPRA" : "COMPROVANTE DE VENDA"}
      </p>
      <hr />
      <div className="linha">
        <span>Data:</span>
        <span>{dataFormatada}</span>
      </div>
      <div className="linha">
        <span>Cliente:</span>
        <span>{pedido.cliente?.nome ?? "Não informado"}</span>
      </div>
      <div className="linha">
        <span>Pagamento:</span>
        <span>{pedido.formaPagamento?.nome ?? "Não informado"}</span>
      </div>
      <hr />
      {pedido.itens.map((item) => {
        const embalagem = item.embalagem ?? "NENHUMA";
        const taraLabel = TARA_LABEL[embalagem];
        const taraKg = embalagem === "BAG" ? 2 : embalagem === "SACO" ? 0.1 : 0;
        const pesoBruto = item.produto.unidade === "KG" && taraKg > 0
          ? item.quantidade + taraKg
          : null;
        return (
          <div key={item.id} style={{ marginBottom: "1mm" }}>
            <div>{item.produto.nome}</div>
            {taraLabel && (
              <div style={{ fontSize: "0.85em", color: "#555" }}>
                {taraLabel}
                {pesoBruto !== null && (
                  <span> | bruto: {pesoBruto.toFixed(2)} kg</span>
                )}
              </div>
            )}
            <div className="linha">
              <span>
                {item.quantidade} {item.produto.unidade === "KG" ? "kg" : "un"} × R$ {item.valorUnitario.toFixed(2)}
              </span>
              <span>R$ {item.subtotal.toFixed(2)}</span>
            </div>
          </div>
        );
      })}
      <hr />
      <div className="linha" style={{ fontWeight: "bold" }}>
        <span>TOTAL</span>
        <span>R$ {pedido.valorTotal.toFixed(2)}</span>
      </div>
      {pedido.observacao && (
        <>
          <hr />
          <p style={{ margin: 0 }}>Obs: {pedido.observacao}</p>
        </>
      )}
      <hr />
      <p style={{ textAlign: "center", margin: 0 }}>Obrigado pela preferência!</p>
    </div>
  );
}

export function imprimirComanda() {
  document.body.classList.add("printing-receipt");
  const handleAfterPrint = () => {
    document.body.classList.remove("printing-receipt");
    window.removeEventListener("afterprint", handleAfterPrint);
  };
  window.addEventListener("afterprint", handleAfterPrint);
  setTimeout(() => window.print(), 50);
}

export const imprimirRecibo = imprimirComanda;
