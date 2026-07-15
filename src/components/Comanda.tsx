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
    embalagemQtd?: number | null;
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
        const qtd = item.embalagemQtd ?? 1;
        const taraUnitKg = embalagem === "BAG" ? 2 : embalagem === "SACO" ? 0.1 : 0;
        const taraTotalKg = taraUnitKg * qtd;
        const temTara = taraTotalKg > 0 && item.produto.unidade === "KG";
        const pesoBruto = temTara ? item.quantidade + taraTotalKg : null;
        const nomeEmb = embalagem === "BAG" ? "Bag" : embalagem === "SACO" ? "Saco" : "";
        return (
          <div key={item.id} style={{ marginBottom: "1mm" }}>
            <div>{item.produto.nome}</div>
            {temTara && (
              <div style={{ fontWeight: "bold" }}>
                <span>Bruto: {pesoBruto!.toFixed(2)} kg | {nomeEmb} {qtd}x (tara: −{taraTotalKg.toFixed(2)} kg)</span>
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

let _imprimindo = false;

export function imprimirComanda() {
  if (_imprimindo) return;
  _imprimindo = true;

  document.body.classList.add("printing-receipt");

  // Libera o estado de impressão. É protegido contra dupla execução porque
  // pode ser chamado tanto pelo evento afterprint quanto pelo tempo-limite.
  let finalizado = false;
  const finalizar = () => {
    if (finalizado) return;
    finalizado = true;
    clearTimeout(timer);
    document.body.classList.remove("printing-receipt");
    window.removeEventListener("afterprint", finalizar);
    _imprimindo = false;
  };

  // Rede de segurança: em impressão silenciosa (kiosk-printing) ou quando a
  // impressora térmica falha, o evento afterprint NÃO dispara. Sem isto, a
  // trava _imprimindo ficaria presa e bloquearia todas as próximas impressões.
  const timer = setTimeout(finalizar, 5000);

  window.addEventListener("afterprint", finalizar);
  setTimeout(() => window.print(), 50);
}

export const imprimirRecibo = imprimirComanda;
