import { api } from "../helper/api";

export async function VerifyNumberExists(number: string) {
  try {
    const response = await api.get(`chatbot/usuario/buscaTelefone/${number}`);

    if (response.data.msg.telefone === number) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
  }
}

export async function searchUserByPhone(number: string) {
  try {
    const response = await api.get(`chatbot/usuario/buscaTelefone/${number}`);

    return {
      id: response.data.msg.id,
      name: response.data.msg.nome,
      cpf: response.data.msg.cpf,
    };
  } catch (error) {
    console.error(error);
  }
}

export async function createVouchersWhatsappBonus(id: string) {
  try {
    const response = await api.post("chatbot/voucher/criarBonus", {
      idUsuario: id,
    });

    if (response.data.msg !== "Sucesso!") {
      return;
    }
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function searchVoucher(id: number) {
  try {
    const response = await api.get(`chatbot/voucher/consumo/${id}`);

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function analyzeSicarData(
  data: string,
  id_dominio: number,
  id_usuario: number
) {
  try {
    const response = await api.post("chatbot/analise/analise-automatica", {
      sicar: data,
      id_dominio: id_dominio,
      id_usuario: id_usuario,
      uf: data.substring(0, 2),
      tipo_busca: "sicar",
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function createUser(name: string, phone: string, cpf: string) {
  try {
    const response = await api.post("chatbot/usuario/criarUsuario", {
      nome: name,
      telefone: phone,
      cpf: cpf,
      usuario_cadastro: "1",
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
