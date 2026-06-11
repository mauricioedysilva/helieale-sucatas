"use client";

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
        <span>{pedido.formaPagamento?.nome ?? "—"}</span>
      </div>
      <hr />
      {pedido.itens.map((item) => (
        <div key={item.id} style={{ marginBottom: "1mm" }}>
          <div>{item.produto.nome}</div>
          <div className="linha">
            <span>
              {item.quantidade} {item.produto.unidade === "KG" ? "kg" : "un"} × R$ {item.valorUnitario.toFixed(2)}
            </span>
            <span>R$ {item.subtotal.toFixed(2)}</span>
          </div>
        </div>
      ))}
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

// Alias genérico: o mecanismo de impressão (ativar `.recibo-80mm` e chamar window.print)
// é o mesmo para qualquer recibo de 80mm — comandas de pedido ou relatórios de fechamento.
export const imprimirRecibo = imprimirComanda;
