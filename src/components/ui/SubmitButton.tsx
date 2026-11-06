"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";
import type { ComponentProps } from "react";

/** Botão de envio que mostra "carregando" enquanto a Server Action roda. */
export function SubmitButton({ pendingLabel, children, ...rest }: ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || rest.disabled} aria-busy={pending} {...rest}>
      {pending ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          {pendingLabel ?? "Aguarde…"}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
