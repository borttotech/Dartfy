import { NextResponse, type NextRequest } from "next/server";
import { getMpPayment, isMercadoPagoConfigured, isValidMpSignature } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Webhook do Mercado Pago. Valida a assinatura, consulta o pagamento na API
 * (fonte da verdade) e, se aprovado, chama dartfy.confirm_payment com a chave secreta.
 */
export async function POST(request: NextRequest) {
  if (!isMercadoPagoConfigured) return NextResponse.json({ ok: false }, { status: 503 });

  const sp = request.nextUrl.searchParams;
  const body = (await request.json().catch(() => ({}))) as { type?: string; action?: string; data?: { id?: string | number } };
  const type = body.type ?? sp.get("type") ?? sp.get("topic");
  const dataId = String(sp.get("data.id") ?? body.data?.id ?? sp.get("id") ?? "");

  if (type !== "payment" || !dataId) return NextResponse.json({ ok: true, ignored: true });
  if (!isValidMpSignature(request.headers.get("x-signature"), request.headers.get("x-request-id"), dataId)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payment = await getMpPayment(dataId);
  if (!payment) return NextResponse.json({ ok: false }, { status: 404 });

  if (payment.status === "approved") {
    const { error } = await createAdminClient().rpc("confirm_payment", { p_external_id: String(payment.id) });
    if (error) {
      console.error("[webhook mercado-pago]", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true });
}
