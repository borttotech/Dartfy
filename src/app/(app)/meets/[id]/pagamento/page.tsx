import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ActionButton } from "@/components/app/ActionButton";
import { CopyField } from "@/components/app/CopyField";
import { IconShield } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/misc";
import { VenueMark } from "@/components/ui/VenueMark";
import { pricing } from "@/config/site";
import { requireUser } from "@/lib/auth";
import { isDemoMode, repo } from "@/lib/data";
import { formatBRL, formatTime, pluralize, relativeDay } from "@/lib/format";
import { qrSvg } from "@/lib/qr";
import { simulatePaymentAction } from "../actions";

export const metadata: Metadata = { title: "Pagamento" };

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/meets/${id}/pagamento`);
  const meet = await repo().getMeet(id);
  if (!meet || meet.hostId !== user.id) notFound();
  if (meet.status !== "closed" || !meet.payment) redirect(`/meets/${id}`);

  const current = meet.payment;
  // Pix ainda sem QR (ex.: falha temporária no Mercado Pago): tenta gerar de novo. close_meet é idempotente.
  const payment = current.pixCopyPaste || isDemoMode ? current : await repo().closeMeet(id, user.id).catch(() => current);
  const extra = Math.max(0, payment.people - pricing.includedPeople);
  const qr = payment.pixCopyPaste ? await qrSvg(payment.pixCopyPaste) : null;

  return (
    <div className="space-y-5">
      <PageHeader title="Pagar com Pix" back={`/meets/${id}`} subtitle="Assim que o Pix cair, as cortesias são liberadas para todos." />

      <div className="surface flex items-center gap-3 p-4">
        <VenueMark venue={meet.venue} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{meet.venue.name}</p>
          <p className="text-sm text-suave">
            {relativeDay(meet.startsAt)} · {formatTime(meet.startsAt)}
          </p>
        </div>
      </div>

      <dl className="surface divide-y divide-tinta/[0.06] text-sm">
        <div className="flex justify-between p-4">
          <dt className="text-suave">Meet até {pricing.includedPeople} pessoas</dt>
          <dd>{formatBRL(pricing.baseCents)}</dd>
        </div>
        {extra > 0 && (
          <div className="flex justify-between p-4">
            <dt className="text-suave">{pluralize(extra, "pessoa extra", "pessoas extras")}</dt>
            <dd>{formatBRL(extra * pricing.extraPersonCents)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between p-4">
          <dt className="font-semibold">Total · {pluralize(payment.people, "pessoa", "pessoas")}</dt>
          <dd className="font-display text-2xl font-bold">{formatBRL(payment.amountCents)}</dd>
        </div>
      </dl>

      {qr ? (
        <section className="surface space-y-4 p-5 text-center">
          <div className="mx-auto w-52 rounded-2xl bg-white p-3" dangerouslySetInnerHTML={{ __html: qr }} />
          <p className="flex items-center justify-center gap-2 text-sm text-alerta">
            <span className="size-2 animate-pulse rounded-full bg-alerta" /> Aguardando pagamento
          </p>
          <CopyField value={payment.pixCopyPaste} />
        </section>
      ) : (
        <section className="surface space-y-2 p-5 text-center">
          <p className="font-semibold">Pix indisponível no momento</p>
          <p className="text-sm text-suave">Não conseguimos gerar o código Pix agora. Atualize a página em alguns instantes.</p>
        </section>
      )}

      {isDemoMode && (
        <div className="rounded-2xl border border-dashed border-alerta/40 p-4">
          <p className="mb-3 text-center text-xs text-alerta">Modo demo: no app real a confirmação chega pelo webhook do Mercado Pago.</p>
          <ActionButton action={simulatePaymentAction} fields={{ meetId: meet.id, paymentId: payment.id }} variant="success" pendingLabel="Confirmando…">
            Simular Pix aprovado
          </ActionButton>
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-apagado">
        <IconShield size={14} /> Pagamento processado pelo Mercado Pago
      </p>
    </div>
  );
}
