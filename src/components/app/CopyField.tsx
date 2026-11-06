"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { IconCheck, IconCopy } from "@/components/ui/icons";

export function CopyField({ value, label = "Copiar código Pix" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-2">
      <p className="truncate rounded-xl bg-tinta/[0.05] px-3 py-2.5 font-mono text-xs text-apagado ring-1 ring-inset ring-tinta/10">{value}</p>
      <button
        type="button"
        className={buttonClass("secondary", "md", "w-full")}
        onClick={async () => {
          await navigator.clipboard.writeText(value).catch(() => window.prompt("Copie:", value));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <IconCheck size={18} className="text-ok" /> : <IconCopy size={18} />}
        {copied ? "Copiado!" : label}
      </button>
    </div>
  );
}
