import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/config/site";

/** Integração Pix com o Mercado Pago (API REST, sem SDK). Somente servidor. */
const API = "https://api.mercadopago.com";
const token = () => process.env.MERCADO_PAGO_ACCESS_TOKEN ?? "";

export const isMercadoPagoConfigured = Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN);

type MpPayment = {
  id: number;
  status: string;
  external_reference?: string | null;
  point_of_interaction?: { transaction_data?: { qr_code?: string } };
};

export async function createPixCharge(input: {
  idempotencyKey: string;
  amountCents: number;
  description: string;
  payerEmail: string;
  externalReference: string;
}) {
  // O Mercado Pago só aceita notification_url pública (https).
  const notificationUrl = SITE_URL.startsWith("https://") ? `${SITE_URL}/api/webhooks/mercado-pago` : undefined;
  const res = await fetch(`${API}/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      transaction_amount: input.amountCents / 100,
      description: input.description.slice(0, 120),
      payment_method_id: "pix",
      payer: { email: input.payerEmail },
      external_reference: input.externalReference,
      notification_url: notificationUrl,
    }),
    cache: "no-store",
  });
  const raw = (await res.json()) as MpPayment & { message?: string };
  const copyPaste = raw.point_of_interaction?.transaction_data?.qr_code;
  if (!res.ok || !copyPaste) throw new Error(`[mercado-pago] Falha ao gerar Pix (${res.status}): ${raw.message ?? "sem QR"}`);
  return { id: String(raw.id), copyPaste, raw };
}

export async function getMpPayment(id: string): Promise<MpPayment | null> {
  const res = await fetch(`${API}/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token()}` },
    cache: "no-store",
  });
  return res.ok ? ((await res.json()) as MpPayment) : null;
}

/**
 * Valida o cabeçalho x-signature do webhook ("ts=...,v1=...").
 * Manifesto: id:[data.id];request-id:[x-request-id];ts:[ts];
 */
export function isValidMpSignature(signature: string | null, requestId: string | null, dataId: string) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return true; // sem segredo configurado, a confirmação depende só da consulta à API abaixo
  if (!signature) return false;
  const parts = Object.fromEntries(signature.split(",").map((p) => p.trim().split("=", 2) as [string, string]));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId ?? ""};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
