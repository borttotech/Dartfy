import "server-only";
import QRCode from "qrcode";

/** QR em SVG (string) para renderizar no servidor, sem imagem externa. */
export async function qrSvg(text: string) {
  return QRCode.toString(text, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#07061a", light: "#ffffff" } });
}

/**
 * Conteúdo do QR de check-in lido pelo bar.
 * TODO(produção): trocar por token assinado (HMAC) emitido pelo servidor, com validade curta,
 * para o QR não poder ser copiado/forjado.
 */
export function voucherPayload(meetCode: string, userId: string) {
  return `dartfy:v1:${meetCode}:${userId}`;
}
