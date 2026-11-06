"use client";

import { useActionState, useState } from "react";
import { Field, Input } from "@/components/ui/fields";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { formatPhone } from "@/lib/format";
import { forgotPasswordAction, signInAction, signUpAction, type AuthState } from "./actions";

export type AuthMode = "entrar" | "criar" | "esqueci";
const initial: AuthState = { ok: false, message: "" };

export function LoginForm({ next, demo, initialMode }: { next: string; demo: boolean; initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  return (
    <div className="space-y-5">
      {mode !== "esqueci" && (
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-tinta/[0.05] p-1 ring-1 ring-inset ring-tinta/[0.06]" role="tablist">
          {(["entrar", "criar"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`h-10 rounded-xl text-sm font-semibold transition ${mode === m ? "bg-tinta/[0.1] text-texto shadow" : "text-apagado hover:text-suave"}`}
            >
              {m === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>
      )}
      {/* key: troca de aba reinicia o estado do formulário */}
      {mode === "entrar" && <SignIn key="entrar" next={next} onForgot={() => setMode("esqueci")} />}
      {mode === "criar" && <SignUp key="criar" next={next} />}
      {mode === "esqueci" && <Forgot key="esqueci" onBack={() => setMode("entrar")} />}
      {demo && <p className="text-center text-xs text-apagado">Modo demo: qualquer e-mail e senha válidos entram direto.</p>}
    </div>
  );
}

function SignIn({ next, onForgot }: { next: string; onForgot: () => void }) {
  const [state, action] = useActionState(signInAction, initial);
  const err = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field label="E-mail" htmlFor="email" error={err.email}>
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="voce@email.com" error={err.email} />
      </Field>
      <Field label="Senha" htmlFor="password" error={err.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="Sua senha" error={err.password} />
      </Field>
      <div className="-mt-1 text-right">
        <button type="button" onClick={onForgot} className="text-sm font-medium text-suave hover:text-texto">
          Esqueci minha senha
        </button>
      </div>
      {state.message && <Alert>{state.message}</Alert>}
      <SubmitButton block size="lg" pendingLabel="Entrando…">
        Entrar
      </SubmitButton>
    </form>
  );
}

function SignUp({ next }: { next: string }) {
  const [state, action] = useActionState(signUpAction, initial);
  const [phone, setPhone] = useState("");
  const err = state.fieldErrors ?? {};

  if (state.ok) return <Alert tone="ok">{state.message}</Alert>;

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field label="Nome" htmlFor="name" error={err.name}>
        <Input id="name" name="name" autoComplete="given-name" placeholder="Como a galera te chama" error={err.name} />
      </Field>
      <Field label="E-mail" htmlFor="email" error={err.email}>
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="voce@email.com" error={err.email} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Celular (WhatsApp)" htmlFor="phone" error={err.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="(41) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            error={err.phone}
          />
        </Field>
        <Field label="Nascimento" htmlFor="birthDate" error={err.birthDate}>
          <Input id="birthDate" name="birthDate" type="date" error={err.birthDate} />
        </Field>
      </div>
      <Field label="Senha" htmlFor="password" hint="Mínimo de 8 caracteres." error={err.password}>
        <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="Crie uma senha" error={err.password} />
      </Field>
      <label className="flex items-start gap-3 text-sm text-suave">
        <input type="checkbox" name="terms" className="mt-0.5 size-4.5 shrink-0 accent-[var(--color-neon)]" />
        <span>
          Tenho 18 anos ou mais e aceito os <span className="text-texto underline underline-offset-2">termos de uso</span> e a{" "}
          <span className="text-texto underline underline-offset-2">política de privacidade</span>.
        </span>
      </label>
      {err.terms && <p className="-mt-2 text-xs font-medium text-erro">{err.terms}</p>}
      {state.message && <Alert>{state.message}</Alert>}
      <SubmitButton block size="lg" pendingLabel="Criando conta…">
        Criar conta
      </SubmitButton>
    </form>
  );
}

function Forgot({ onBack }: { onBack: () => void }) {
  const [state, action] = useActionState(forgotPasswordAction, initial);
  const err = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <div>
        <h2 className="text-xl font-bold">Esqueceu a senha?</h2>
        <p className="mt-1 text-sm text-suave">Informe seu e-mail e enviamos um link para criar uma nova.</p>
      </div>
      {state.ok ? (
        <Alert tone="ok">{state.message}</Alert>
      ) : (
        <>
          <Field label="E-mail" htmlFor="email" error={err.email}>
            <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="voce@email.com" error={err.email} />
          </Field>
          <SubmitButton block size="lg" pendingLabel="Enviando…">
            Enviar link
          </SubmitButton>
        </>
      )}
      <button type="button" onClick={onBack} className="w-full text-center text-sm font-medium text-suave hover:text-texto">
        ← Voltar para o login
      </button>
    </form>
  );
}
