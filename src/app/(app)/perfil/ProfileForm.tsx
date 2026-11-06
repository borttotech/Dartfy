"use client";

import { useActionState } from "react";
import { Field, Input, Select } from "@/components/ui/fields";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState, type Profile } from "@/lib/types";
import { saveProfileAction } from "./actions";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(saveProfileAction, initialActionState);
  const err = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field label="Nome" htmlFor="name" error={err.name}>
        <Input id="name" name="name" defaultValue={profile.name} autoComplete="name" required error={err.name} />
      </Field>
      <Field label="E-mail" htmlFor="email" hint="Para recibos e novidades dos bares. Opcional." error={err.email}>
        <Input id="email" name="email" type="email" inputMode="email" defaultValue={profile.email ?? ""} placeholder="voce@email.com" autoComplete="email" error={err.email} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Gênero" htmlFor="gender" error={err.gender}>
          <Select id="gender" name="gender" defaultValue={profile.gender ?? ""}>
            <option value="">Selecione</option>
            <option value="feminino">Feminino</option>
            <option value="masculino">Masculino</option>
            <option value="outro">Outro</option>
            <option value="prefiro_nao_dizer">Prefiro não dizer</option>
          </Select>
        </Field>
        <Field label="Nascimento" htmlFor="birthDate" error={err.birthDate}>
          <Input id="birthDate" name="birthDate" type="date" defaultValue={profile.birthDate ?? ""} error={err.birthDate} />
        </Field>
      </div>
      {state.message && <Alert tone={state.ok ? "ok" : "erro"}>{state.message}</Alert>}
      <SubmitButton block size="lg" pendingLabel="Salvando…">
        Salvar
      </SubmitButton>
    </form>
  );
}
