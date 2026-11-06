"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { IconCheck } from "@/components/ui/icons";
import { initialActionState } from "@/lib/types";
import { respondInviteAction } from "./actions";

export function RespondButtons({ code, declined, loggedIn }: { code: string; declined: boolean; loggedIn: boolean }) {
  const [state, action] = useActionState(respondInviteAction, initialActionState);
  return (
    <div className="space-y-2.5">
      {state.message && !state.ok && <Alert>{state.message}</Alert>}
      {declined && <p className="text-center text-sm text-suave">Você recusou este convite. Mudou de ideia?</p>}
      <form action={action}>
        <input type="hidden" name="code" value={code} />
        <input type="hidden" name="accept" value="1" />
        <SubmitButton block size="lg" pendingLabel="Confirmando…" icon={<IconCheck size={20} strokeWidth={2.4} />}>
          {loggedIn ? "Bora! Confirmar presença" : "Confirmar com meu celular"}
        </SubmitButton>
      </form>
      {!declined && (
        <form action={action}>
          <input type="hidden" name="code" value={code} />
          <input type="hidden" name="accept" value="0" />
          <SubmitButton block variant="ghost" size="md" pendingLabel="Enviando…">
            Não vou dessa vez
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
