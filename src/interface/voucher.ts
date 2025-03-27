export interface Voucher {
  id_dominio: number;
  nomeDominio: string;
  habilitado: {
    quantidade_voucher_usado: number;
    quantidade_voucher_disponivel: number;
  };
  desabilitado: {
    quantidade_voucher_usado: number;
    quantidade_voucher_disponivel: number;
  };
}
