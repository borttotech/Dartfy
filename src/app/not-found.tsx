import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/misc";

export default function NotFound() {
  return (
    <div className="ambient grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-sm">
        <Logo className="mx-auto mb-8 !self-center" />
        <h1 className="text-2xl font-bold">Esse rolê não existe (ou acabou)</h1>
        <p className="mt-2 text-suave">O link pode estar incompleto ou o meet foi removido.</p>
        <ButtonLink href="/" className="mt-6">
          Ir para o início
        </ButtonLink>
      </div>
    </div>
  );
}
