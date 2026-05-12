import {
  getBuyTemplate,
  getBuyTemplateSpanish,
  getSaleTemplate,
  getSaleTemplateSpanish,
  getRedeemTemplateSuccess,
  getRedeemTemplateSuccessSpanish,
  getRedeemTemplateWithErrors,
  getRedeemTemplateWithErrorsSpanish,
  getWineryEmail,
} from "./emailTemplate";
import axios from "axios";

const EMAIL_API_URL = "https://dondetopa.openvino.org/email/send";

export async function sendEmailMessage({
  email,
  type,
  txHash,
  language,
  wineryEmail,
  wineryRedeemEmail,
  wineryId,
  tokenName,
  count,
  userName,
}) {
  try {
    const isSpanish = language === "es";

    let wineryOperation;
    let body = {
      to: email,
      subject: "",
      wineryEmail,
      html: "",
      transactionHash: txHash,
      wineryHtml: "",
    };

    switch (type) {
      case "buy":
        wineryOperation = "Compra de Wine Tokens";
        body.subject = isSpanish
          ? "Compra de Wine Tokens confirmada - Gracias! 🍷"
          : "Wine tokens purchased - Thank you! 🍷";
        body.html = isSpanish
          ? getBuyTemplateSpanish(tokenName, count, wineryId, wineryEmail)
          : getBuyTemplate(tokenName, count, wineryId, wineryEmail);
        break;

      case "sale":
        wineryOperation = "Venta de Wine Tokens";
        body.subject = isSpanish
          ? "Venta de Wine tokens completada ✅"
          : "Wine tokens sale completed";
        body.html = isSpanish
          ? getSaleTemplateSpanish(wineryEmail)
          : getSaleTemplate(wineryEmail);
        break;

      case "sucess":
        wineryOperation = isSpanish ? "Redeem de Wine Tokens" : "Wine Tokens Redeem";
        body.subject = isSpanish
          ? "Redimiste tus Wine tokens! 🍷"
          : "Wine tokens redeemed - let's plan your delivery 🍷";
        body.html = isSpanish
          ? getRedeemTemplateSuccessSpanish(wineryRedeemEmail)
          : getRedeemTemplateSuccess(wineryRedeemEmail);
        break;

      case "error":
        wineryOperation = isSpanish ? "Redeem de Wine Tokens" : "Wine Tokens Redeem";
        body.subject = isSpanish
          ? "Redimiste tus Wine tokens! - pago de envío pendiente ⚠️"
          : "Wine tokens redeemed - shipping payment pending";
        body.html = isSpanish
          ? getRedeemTemplateWithErrorsSpanish(tokenName, wineryId, wineryRedeemEmail)
          : getRedeemTemplateWithErrors(tokenName, wineryId, wineryRedeemEmail);
        break;
    }

    body.wineryHtml = getWineryEmail(wineryOperation, userName, email, txHash);

    const response = await axios.post(EMAIL_API_URL, body);
    return response;
  } catch (error) {
    console.log(error);
  }
}
