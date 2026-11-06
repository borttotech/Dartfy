import type { ComponentProps, ReactNode } from "react";

export const inputClass =
  "h-12 w-full rounded-2xl bg-tinta/[0.05] px-4 text-[0.9375rem] text-texto ring-1 ring-inset ring-tinta/10 placeholder:text-apagado transition focus:bg-tinta/[0.08] focus:ring-2 focus:ring-neon/70 focus:outline-none aria-[invalid=true]:ring-erro/70";

export function Field({ label, hint, error, htmlFor, children }: { label: string; hint?: string; error?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-suave">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-erro`} className="text-xs font-medium text-erro">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-apagado">{hint}</p>
      )}
    </div>
  );
}

export function Input({ className = "", error, ...rest }: ComponentProps<"input"> & { error?: string }) {
  return <input className={`${inputClass} ${className}`} aria-invalid={error ? true : undefined} aria-describedby={error && rest.id ? `${rest.id}-erro` : undefined} {...rest} />;
}

export function Select({ className = "", children, ...rest }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={`${inputClass} appearance-none pr-10 [&>option]:bg-breu ${className}`} {...rest}>
        {children}
      </select>
      <svg className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-suave" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
