import dotenv from "dotenv";
import WhatsApp from "whatsapp";
import { InteractiveObject } from "whatsapp/build/types/messages";

dotenv.config();

const PHONE_NUMBER_ID = parseInt(process.env.WHATSAPP_PHONE_NUMBER_ID || "");
const wa = new WhatsApp(PHONE_NUMBER_ID);

export async function sendWhatsAppMessage(
  recipient_number: number,
  message: string
) {
  try {
    await wa.messages.text({ body: message }, recipient_number);
  } catch (e) {
    console.error(JSON.stringify(e));
  }
}

export async function sendWhatsAppImage(
  recipient_number: number,
  image_url: string,
  caption: string
) {
  try {
    await wa.messages.image(
      { link: image_url, caption: caption },
      recipient_number
    );
  } catch (e) {
    console.error(JSON.stringify(e));
  }
}

export async function sendWhatsAppInteractiveMessage(
  recipient_number: number,
  message: string,
  options: string[]
) {
  try {
    await wa.messages.interactive(
      createInteractiveMessage(message, options),
      recipient_number
    );
  } catch (e) {
    console.error(JSON.stringify(e));
  }
}

export async function sendWhatsAppMessageList(
  recipient_number: number,
  vouchers: any[]
) {
  try {
    await wa.messages.interactive(
      createWhatsAppListMessage(vouchers),
      recipient_number
    );
  } catch (e) {
    console.error(JSON.stringify(e));
  }
}
export async function sendWhatsAppDocument(
  recipient_number: number,
  document_url: string
) {
  try {
    await wa.messages.document(
      {
        link: document_url,
        caption: "Relatório Simplificado da Análise Socioambiental Automática",
        filename: "Relatorio.pdf",
      },
      recipient_number
    );
  } catch (e) {
    console.error(JSON.stringify(e));
  }
}

function createInteractiveMessage(bodyText: string, buttonTitles: string[]) {
  return {
    type: "button",
    body: {
      text: bodyText,
    },
    action: {
      buttons: buttonTitles.map((title, index) => ({
        type: "reply" as const,
        reply: {
          id: `button_${index + 1}`,
          title: title,
        },
      })),
    },
  } as InteractiveObject;
}

function createWhatsAppListMessage(vouchers: any[]) {
  const rows = vouchers
    .filter((voucher) => voucher.habilitado > 0 || voucher.desabilitado > 0)
    .map((voucher) => {
      const total = voucher.habilitado + voucher.desabilitado;
      return {
        id: String(voucher.id_dominio),
        title: voucher.nomeDominio,
        description: `${total} vale${total > 1 ? "s" : ""} disponível${
          total > 1 ? "s" : ""
        }`,
      };
    });

  const list_message = {
    type: "list",
    body: {
      text: "Escolha um voucher disponível para iniciar a análise:",
    },
    action: {
      button: "Selecionar voucher",
      sections: [
        {
          title: "Vales disponíveis",
          rows,
        },
      ],
    },
  };

  return list_message as unknown as InteractiveObject;
}
