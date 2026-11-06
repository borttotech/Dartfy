"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/fields";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { resetPasswordAction, type AuthState } from "../entrar/actions";

export function ResetForm() {
  const [state, action] = useActionState(resetPasswordAction, { ok: false, message: "" } satisfies AuthState);
  const err = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field label="Nova senha" htmlFor="password" hint="Mínimo de 8 caracteres." error={err.password}>
        <Input id="password" name="password" type="password" autoComplete="new-password" error={err.password} />
      </Field>
      <Field label="Repita a senha" htmlFor="confirm" error={err.confirm}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" error={err.confirm} />
      </Field>
      {state.message && <Alert>{state.message}</Alert>}
      <SubmitButton block size="lg" pendingLabel="Salvando…">
        Salvar nova senha
      </SubmitButton>
    </form>
  );
}
