"use client";

import { useActionState, useState } from "react";
import { Field, Input } from "@/components/ui/fields";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { formatPhone } from "@/lib/format";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = { step: "phone", phone: "", message: "" };

export function LoginForm({ next, demo }: { next: string; demo: boolean }) {
  const [state, action] = useActionState(loginAction, initial);
  const [phone, setPhone] = useState("");

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      {state.step === "phone" ? (
        <Field label="Seu celular" htmlFor="phone" hint="Enviamos um código por SMS. Sem senha." error={state.message || undefined}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="(41) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            error={state.message || undefined}
            autoFocus
            className="!h-14 text-lg tracking-wide"
          />
        </Field>
      ) : (
        <>
          <p className="text-sm text-suave">
            Código enviado para <strong className="text-texto">{formatPhone(state.phone)}</strong>
          </p>
          <Field label="Código de 6 dígitos" htmlFor="code" error={state.message || undefined}>
            <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="••••••" autoFocus className="!h-14 text-center text-2xl tracking-[0.5em]" error={state.message || undefined} />
          </Field>
        </>
      )}
      <SubmitButton block size="lg" pendingLabel={state.step === "phone" ? "Enviando…" : "Verificando…"}>
        {state.step === "phone" ? "Continuar" : "Entrar"}
      </SubmitButton>
      {demo && <Alert tone="alerta">Modo demo: qualquer celular válido entra direto, sem SMS.</Alert>}
    </form>
  );
}
