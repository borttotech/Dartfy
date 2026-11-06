"use client";

import { useActionState, type ReactNode } from "react";
import type { ButtonSize, ButtonVariant } from "@/components/ui/Button";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState, type ActionState } from "@/lib/types";

/** Botão que dispara uma Server Action e mostra o erro de regra de negócio logo abaixo. */
export function ActionButton({
  action,
  fields,
  children,
  pendingLabel,
  variant,
  size = "lg",
  icon,
  confirm,
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  children: ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  confirm?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className="space-y-2"
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <SubmitButton block size={size} variant={variant} icon={icon} pendingLabel={pendingLabel}>
        {children}
      </SubmitButton>
      {state.message && <Alert tone={state.ok ? "ok" : "erro"}>{state.message}</Alert>}
    </form>
  );
}
