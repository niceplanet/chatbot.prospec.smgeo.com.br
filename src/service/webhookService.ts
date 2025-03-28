import {
  sendWhatsAppDocument,
  sendWhatsAppImage,
  sendWhatsAppInteractiveMessage,
  sendWhatsAppMessage,
  sendWhatsAppMessageList,
} from "./whatsappService";
import {
  analyzeSicarData,
  createUser,
  createVouchersWhatsappBonus,
  searchUserByPhone,
  searchVoucher,
  VerifyNumberExists,
} from "../repository/prospecRepository";
import {
  getSession,
  saveSession,
  updateUserId,
} from "../repository/sessionRepository";
import { validarCpf } from "../helper/verifyCpf";
import {
  getAllVouchers,
  getDesabilitadosDoDominio,
  isWhatsAppBonusVoucherEmpty,
  userCpfExists,
  verificarConsumoVouchers,
  verifyMessageDataType,
  verifyUserByPhone,
  verifyWhatsBonusExists,
} from "../helper/webhooks";

let id_voucher = 0;

export async function startConversation(body: any) {
  try {
    for (const entry of body.entry) {
      const webhookEvent = entry.changes[0];
      const messageData = webhookEvent.value.messages?.[0];
      if (messageData) {
        const senderId = messageData.from;
        const message = verifyMessageDataType(messageData);
        let session = await getSession(senderId);
        if (!session) {
          session = { step: "start" };
        }

        switch (session.step) {
          case "start":
            await sendWhatsAppMessage(
              senderId,
              "Olá! 🌿 Bem-vindo ao Chatbot NIA! Aqui você pode realizar análises socioambientais de propriedades e fazendas fornecedoras de animais. Estou aqui para te ajudar nesse processo. 😊"
            );
            if (!(await verifyUserByPhone(senderId))) {
              await sendWhatsAppMessage(
                senderId,
                "Não consegui te localizar em nossos usuários. Mas não tem problema, por gentileza me informe seu nome e CPF abaixo para ganhar 3 vales bônus! Lembrando que você poderá utilizar-lo pelo aplicativo prospec ou por aqui mesmo."
              );
              await sendWhatsAppMessage(
                senderId,
                "Vamos começar. Por favor, informe seu CPF:"
              );
              await saveSession(senderId, "awaiting_cpf");
            } else {
              await sendWhatsAppMessage(
                senderId,
                "Notamos que você já possui um cadastro conosco."
              );
              const userByPhone = await searchUserByPhone(senderId);
              const vouchers = await searchVoucher(userByPhone?.id);
              session = {
                ...session,
                voucherBonus: vouchers,
                cpf: userByPhone?.cpf,
                name: userByPhone?.name,
                userId: userByPhone?.id,
              };

              await saveSession(
                senderId,
                "confirming_voucher_bonus",
                userByPhone?.cpf,
                userByPhone?.name,
                userByPhone?.id
              );

              if (await verifyWhatsBonusExists(userByPhone?.id)) {
                await createVouchersWhatsappBonus(userByPhone?.id);
                await sendWhatsAppMessage(
                  senderId,
                  `Olá ${userByPhone?.name}, estou lhe concedendo 3 vales bônus para analisar suas propriedades ou propriedades de seu interesse!`
                );
                await saveSession(
                  senderId,
                  "awaiting_analysis_type",
                  userByPhone?.cpf,
                  userByPhone?.name,
                  userByPhone?.id
                );
                await sendWhatsAppInteractiveMessage(
                  senderId,
                  "Qual o tipo de busca que gostaria de realizar:",
                  ["SICAR"]
                );
              } else {
                const result = getAllVouchers(vouchers);
                if (await verificarConsumoVouchers(result)) {
                  await sendWhatsAppMessage(
                    senderId,
                    `Desculpe, parece que você não possui nenhum vale disponível no momento. Para obter mais vales, por favor, acesse o aplicativo. 🌟`
                  );
                  await saveSession(
                    senderId,
                    "start",
                    userByPhone?.cpf,
                    userByPhone?.name,
                    userByPhone?.id
                  );
                } else if (isWhatsAppBonusVoucherEmpty(result)) {
                  await sendWhatsAppMessageList(senderId, result);

                  await saveSession(
                    senderId,
                    "list_vouchers_wallet",
                    userByPhone?.cpf,
                    userByPhone?.name,
                    userByPhone?.id
                  );
                } else {
                  id_voucher = 646;
                  await sendWhatsAppInteractiveMessage(
                    senderId,
                    `Você tem ${
                      (
                        await getDesabilitadosDoDominio(646, vouchers)
                      ).quantidade
                    } vale(s) bônus disponíveis. Deseja iniciar uma análise agora?`,
                    ["Sim", "Não"]
                  );
                  await saveSession(
                    senderId,
                    "awaiting_analysis_confirmation",
                    userByPhone?.cpf,
                    userByPhone?.name,
                    userByPhone?.id
                  );
                }
              }
            }
            break;

          case "awaiting_cpf":
            if (!validarCpf(message.body)) {
              await sendWhatsAppMessage(
                senderId,
                "CPF inválido, por favor, informe um CPF válido."
              );
              break;
            }
            if (await userCpfExists(message.body)) {
              await sendWhatsAppMessage(
                senderId,
                "Notamos que você já possui um cadastro conosco. Por favor, entre no aplicativo ou entre em contato com o suporte, para atualizar seu numero de telefone."
              );

              await sendWhatsAppImage(
                senderId,
                "https://github.com/user-attachments/assets/a3977226-20e7-42bc-b590-d2e584c32675",
                "Acesse o aplicativo Prospec!"
              );

              await saveSession(senderId, "start");
              break;
            }
            await sendWhatsAppMessage(
              senderId,
              "Certo, agora preciso que me informe seu Nome para finalizarmos seu cadastro!"
            );
            await saveSession(
              senderId,
              "awaiting_name",
              validarCpf(message.body)
            );
            session = { ...session, cpf: message.body };
            break;

          case "awaiting_name":
            await createUser(message.body, senderId, session.cpf)
              .then(async (res) => {
                session = { ...session, name: message.body, user_id: res.id };
                await sendWhatsAppInteractiveMessage(
                  senderId,
                  "Seu cadastro foi finalizado! 🎉 É um prazer tê-lo conosco. Você ganhou 3 vales para realizar suas análises. Vamos começar uma análise?",
                  ["Sim", "Não"]
                );
                await saveSession(
                  senderId,
                  "awaiting_analysis_confirmation",
                  session.cpf,
                  session.name
                );
                await updateUserId(senderId, res.id);
                await createVouchersWhatsappBonus(res.id);
              })
              .catch(async () => {
                await sendWhatsAppMessage(
                  senderId,
                  "Ocorreu um erro ao processar seu cadastro. Por favor, tente novamente."
                );
                await saveSession(senderId, "start");
              });

            break;

          case "confirming_voucher_bonus":
            const userByPhone = await searchUserByPhone(senderId);
            const vouchers = await searchVoucher(userByPhone?.id);
            if (
              (await getDesabilitadosDoDominio(646, vouchers)).quantidade <= 0
            ) {
              id_voucher = 646;
              await sendWhatsAppMessage(
                senderId,
                `Olá ${userByPhone?.name}, estou lhe concedendo 3 vales bônus para analisar suas propriedades ou propriedades de seu interesse!`
              );
              await saveSession(
                senderId,
                "start",
                userByPhone?.cpf,
                userByPhone?.name,
                userByPhone?.id
              );
              break;
            }

          case "awaiting_analysis_confirmation":
            if (message?.title.toLowerCase() === "sim") {
              await saveSession(
                senderId,
                "awaiting_analysis_type",
                session.cpf,
                session.name,
                session.user_id
              );
              await sendWhatsAppInteractiveMessage(
                senderId,
                "Certo, me informe qual o tipo de busca que gostaria de realizar:",
                ["SICAR"]
              );
            } else {
              await sendWhatsAppMessage(
                senderId,
                "Que bom que pude te ajudar! 🌟 Aproveito para te convidar a utilizar nosso aplicativo, onde você terá acesso a mais ferramentas e recursos para suas análises. Estamos sempre à disposição para auxiliá-lo!"
              );
              await sendWhatsAppImage(
                senderId,
                "https://github.com/user-attachments/assets/a3977226-20e7-42bc-b590-d2e584c32675",
                "Acesse o aplicativo Prospec!"
              );
              await saveSession(
                senderId,
                "start",
                session.cpf,
                session.name,
                session.user_id
              );
            }
            break;

          case "awaiting_analysis_type":
            if (message?.title === "SICAR") {
              await sendWhatsAppMessage(
                senderId,
                "Por favor, informe o número do SICAR que você gostaria de analisar:"
              );
              await saveSession(
                senderId,
                "awaiting_analysis_data",
                session.cpf,
                session.name,
                session.user_id
              );
            }
            break;

          case "awaiting_analysis_data":
            await sendWhatsAppMessage(
              senderId,
              "Certo, a análise está em andamento. Por favor, aguarde."
            );
            await analyzeSicarData(message.body, id_voucher, session.user_id)
              .then(async (res) => {
                await sendWhatsAppDocument(senderId, res.fileUrl);
                await saveSession(
                  senderId,
                  "start",
                  session.cpf,
                  session.name,
                  session.user_id
                );
                await sendWhatsAppMessage(
                  senderId,
                  "Que bom que pude te ajudar! 🌟 Aproveito para te convidar a utilizar nosso aplicativo, onde você terá acesso a mais ferramentas e recursos para suas análises. Estamos sempre à disposição para auxiliá-lo!"
                );
                await sendWhatsAppImage(
                  senderId,
                  "https://github.com/user-attachments/assets/a3977226-20e7-42bc-b590-d2e584c32675",
                  "Acesse o aplicativo Prospec!"
                );
              })
              .catch(async (err) => {
                await sendWhatsAppMessage(
                  senderId,
                  "Ocorreu um erro ao processar a análise. Por favor, tente novamente."
                );
                await saveSession(
                  senderId,
                  "start",
                  session.cpf,
                  session.name,
                  session.user_id
                );
              });
            break;

          case "list_vouchers_wallet":
            id_voucher = parseInt(message.id);
            await sendWhatsAppInteractiveMessage(
              senderId,
              "Certo, me informe qual o tipo de busca que gostaria de realizar:",
              ["SICAR"]
            );

            await saveSession(
              senderId,
              "awaiting_analysis_type",
              session.cpf,
              session.name,
              session.user_id
            );
            break;
          default:
            break;
        }
      }
    }
    return;
  } catch (error) {
    console.error(error);
    await sendWhatsAppMessage(
      body.entry[0].changes[0].value.messages[0].from,
      "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente."
    );
  }
}
