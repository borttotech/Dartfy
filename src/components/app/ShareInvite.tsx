"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { IconCheck, IconCopy, IconShare, IconWhatsapp } from "@/components/ui/icons";

/** Compartilhar o link do convite: WhatsApp primeiro (é onde a galera está), depois copiar/compartilhar nativo. */
export function ShareInvite({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const full = `${text}\n${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copie o link:", url);
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Convite Dartfy", text, url });
      } catch {
        /* usuário cancelou */
      }
    } else copy();
  }

  return (
    <div className="space-y-2.5">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(full)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass("success", "lg", "w-full !bg-[#25d366]")}
      >
        <IconWhatsapp size={22} />
        Convidar pelo WhatsApp
      </a>
      <div className="grid grid-cols-2 gap-2.5">
        <button type="button" onClick={copy} className={buttonClass("secondary", "md")}>
          {copied ? <IconCheck size={18} className="text-ok" /> : <IconCopy size={18} />}
          {copied ? "Copiado!" : "Copiar link"}
        </button>
        <button type="button" onClick={nativeShare} className={buttonClass("secondary", "md")}>
          <IconShare size={18} />
          Compartilhar
        </button>
      </div>
      <p className="truncate text-center text-xs text-apagado">{url.replace(/^https?:\/\//, "")}</p>
    </div>
  );
}
