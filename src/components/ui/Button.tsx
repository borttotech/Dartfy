import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "success" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-sobre-brand glow-neon hover:brightness-110",
  secondary: "bg-tinta/[0.07] text-texto ring-1 ring-inset ring-tinta/10 hover:bg-tinta/[0.11]",
  ghost: "text-suave hover:text-texto hover:bg-tinta/[0.06]",
  success: "bg-ok text-noite hover:brightness-105",
  danger: "text-erro ring-1 ring-inset ring-erro/30 hover:bg-erro/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm rounded-xl gap-1.5",
  md: "h-12 px-5 text-[0.9375rem] rounded-2xl gap-2",
  lg: "h-14 px-6 text-base rounded-2xl gap-2.5",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") {
  return [
    "inline-flex select-none items-center justify-center font-semibold whitespace-nowrap",
    "transition-[filter,background-color,color,transform] duration-200 active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    extra,
  ].join(" ");
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; icon?: ReactNode; children: ReactNode };

export function Button({ variant, size, block, icon, children, className = "", ...rest }: Common & ComponentProps<"button">) {
  return (
    <button className={buttonClass(variant, size, `${block ? "w-full" : ""} ${className}`)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, block, icon, children, className = "", ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass(variant, size, `${block ? "w-full" : ""} ${className}`)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
