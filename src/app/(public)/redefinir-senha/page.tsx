import type { Metadata } from "next";
import { Logo } from "@/components/ui/misc";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Nova senha", robots: { index: false } };

/** Destino do link "Esqueci minha senha" (passa antes por /auth/confirm, que cria a sessão). */
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col py-10">
      <div className="my-auto">
        <Logo size="lg" className="mb-8" />
        <h1 className="text-[1.75rem] font-extrabold">Crie uma nova senha</h1>
        <p className="mt-2 mb-7 text-suave">Depois de salvar, você já entra no app.</p>
        <ResetForm />
      </div>
    </div>
  );
}
