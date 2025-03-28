import { Voucher } from "../interface/voucher";
import {
  getUserByCpf,
  searchVoucher,
  VerifyNumberExists,
} from "../repository/prospecRepository";

async function getDesabilitadosDoDominio(dominio: number, vouchers: Voucher[]) {
  const dom = vouchers.find((item) => item.id_dominio === dominio);

  if (!dom) {
    return {
      id_dominio: dominio,
      quantidade: 0,
    };
  }

  const { quantidade_voucher_disponivel } = dom.desabilitado || {};

  return {
    id_dominio: dom.id_dominio,
    quantidade: quantidade_voucher_disponivel,
  };
}

function getAllVouchers(vouchers: Voucher[]) {
  return vouchers.map((voucher) => {
    const habilitado = voucher.habilitado?.quantidade_voucher_disponivel || 0;
    const desabilitado =
      voucher.desabilitado?.quantidade_voucher_disponivel || 0;

    return {
      id_dominio: voucher.id_dominio,
      nomeDominio: voucher.nomeDominio,
      habilitado,
      desabilitado,
    };
  });
}

function isWhatsAppBonusVoucherEmpty(vouchers: any[]): boolean {
  const voucher = vouchers.find((v) => v.id_dominio === 646);
  return (voucher?.desabilitado || 0) === 0;
}

async function verificarConsumoVouchers(vouchers: any[]): Promise<boolean> {
  return vouchers.every(
    (voucher) => voucher.habilitado === 0 && voucher.desabilitado === 0
  );
}

async function verifyWhatsBonusExists(id: number): Promise<boolean> {
  const vouchers = await searchVoucher(id);

  return vouchers.some((voucher: Voucher) => voucher.id_dominio === 646);
}

function verifyMessageDataType(messageData: any) {
  if (messageData.type === "interactive") {
    return {
      id: messageData.interactive[messageData.interactive.type].id,
      title: messageData.interactive[messageData.interactive.type].title,
    };
  } else {
    return messageData.text;
  }
}

async function userCpfExists(cpf: string) {
  try {
    const res = await getUserByCpf(cpf);
    if (res?.code === 400) {
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
  }
}

async function verifyUserByPhone(number: string) {
  try {
    const res = await VerifyNumberExists(number);
    if (res?.telefone === number) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
  }
}

export {
  getDesabilitadosDoDominio,
  getAllVouchers,
  isWhatsAppBonusVoucherEmpty,
  verificarConsumoVouchers,
  verifyWhatsBonusExists,
  verifyMessageDataType,
  userCpfExists,
  verifyUserByPhone,
};
