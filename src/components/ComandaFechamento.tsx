"use client";

export type FechamentoParaImpressao = {
  data: string; // yyyy-mm-dd
  caixa: { valorAbertura: number; valorFechamento: number | null } | null;
  totalCompras: number;
  totalVendas: number;
  totalGastos: number;
  saldo: number;
  quantidadeCompras: number;
  quantidadeVendas: number;
  porProduto: {
    nome: string;
    unidade: "KG" | "UNIDADE";
    quantidadeComprada: number;
    valorComprado: number;
    quantidadeVendida: number;
    valorVendido: number;
  }[];
  estoqueAtual: { nome: string; unidade: "KG" | "UNIDADE"; estoqueAtual: number; estoqueMinimo: number }[];
};

export function ComandaFechamento({ fechamento }: { fechamento: FechamentoParaImpressao | null }) {
  if (!fechamento) return <div className="recibo-80mm" />;

  const dataFormatada = new Date(`${fechamento.data}T12:00:00`).toLocaleDateString("pt-BR");
  const movimentacoes = fechamento.porProduto.filter((p) => p.quantidadeComprada > 0 || p.quantidadeVendida > 0);

  return (
    <div className="recibo-80mm">
      <h2>HelieAle Sucatas</h2>
      <p style={{ textAlign: "center", margin: "0 0 1mm 0" }}>FECHAMENTO DE CAIXA</p>
      <p style={{ textAlign: "center", margin: "0 0 2mm 0" }}>{dataFormatada}</p>
      <hr />
      <div className="linha">
        <span>Abertura do caixa:</span>
        <span>R$ {(fechamento.caixa?.valorAbertura ?? 0).toFixed(2)}</span>
      </div>
      <div className="linha">
        <span>Compras ({fechamento.quantidadeCompras}):</span>
        <span>R$ {fechamento.totalCompras.toFixed(2)}</span>
      </div>
      <div className="linha">
        <span>Vendas ({fechamento.quantidadeVendas}):</span>
        <span>R$ {fechamento.totalVendas.toFixed(2)}</span>
      </div>
      <div className="linha">
        <span>Gastos:</span>
        <span>R$ {fechamento.totalGastos.toFixed(2)}</span>
      </div>
      <hr />
      <div className="linha" style={{ fontWeight: "bold" }}>
        <span>SALDO CALCULADO</span>
        <span>R$ {fechamento.saldo.toFixed(2)}</span>
      </div>
      {fechamento.caixa?.valorFechamento != null && (
        <div className="linha">
          <span>Fechamento informado:</span>
          <span>R$ {fechamento.caixa.valorFechamento.toFixed(2)}</span>
        </div>
      )}
      <hr />
      <p style={{ margin: "0 0 1mm 0", fontWeight: "bold" }}>Movimentação por produto</p>
      {movimentacoes.length === 0 && <p style={{ margin: 0 }}>Nenhuma movimentação hoje.</p>}
      {movimentacoes.map((p) => (
        <div key={p.nome} style={{ marginBottom: "1mm" }}>
          <div>{p.nome}</div>
          {p.quantidadeComprada > 0 && (
            <div className="linha">
              <span>
                Comprado: {p.quantidadeComprada} {p.unidade === "KG" ? "kg" : "un"}
              </span>
              <span>R$ {p.valorComprado.toFixed(2)}</span>
            </div>
          )}
          {p.quantidadeVendida > 0 && (
            <div className="linha">
              <span>
                Vendido: {p.quantidadeVendida} {p.unidade === "KG" ? "kg" : "un"}
              </span>
              <span>R$ {p.valorVendido.toFixed(2)}</span>
            </div>
          )}
        </div>
      ))}
      <hr />
      <p style={{ margin: "0 0 1mm 0", fontWeight: "bold" }}>Estoque ao final do dia</p>
      {fechamento.estoqueAtual.map((p) => (
        <div className="linha" key={p.nome}>
          <span>
            {p.nome}
            {p.estoqueAtual <= p.estoqueMinimo ? " (baixo)" : ""}
          </span>
          <span>
            {p.estoqueAtual} {p.unidade === "KG" ? "kg" : "un"}
          </span>
        </div>
      ))}
      <hr />
      <p style={{ textAlign: "center", margin: 0 }}>Expediente encerrado</p>
      <p style={{ textAlign: "center", margin: 0 }}>Obrigado pelo trabalho de hoje!</p>
    </div>
  );
}
