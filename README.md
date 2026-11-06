# Dartfy — app web

Organize o meet, chame a galera pelo WhatsApp, feche a lista no Pix e todo mundo ganha cortesia no bar.

Stack (mesmo padrão do Iterum): **Next.js 16 (App Router) · React 19 · Tailwind 4 · Supabase SSR · Server Actions · TypeScript estrito**.

## Rodar

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm run build
```

Sem variáveis do Supabase o app sobe em **modo demo**: dados em memória (`src/lib/data/demo/seed.ts`), usuário fixo, login sem SMS e um botão "Simular Pix aprovado". Reiniciar o servidor restaura o seed.

## Fluxo do produto

```
/criar ──▶ /meets/[id] ──(link WhatsApp)──▶ /c/[code] (convidado aceita)
                │
                └─ anfitrião fecha a lista ──▶ /meets/[id]/pagamento (Pix)
                                                    │ webhook Mercado Pago
                                                    ▼
                                         meet "paid" ─▶ check-in no bar ─▶ QR
```

| Rota | Tela |
| --- | --- |
| `/` | Início: convites pendentes, próximo meet, cortesias de hoje |
| `/criar` | Wizard em 3 passos: local → dia/horário → revisão |
| `/meets`, `/meets/[id]` | Meus meets; detalhe com convite, lista, fechamento, check-in/QR |
| `/meets/[id]/pagamento` | Pix (QR + copia e cola) |
| `/convites` | Convites recebidos (pendentes / vou / anteriores) |
| `/c/[code]` | **Convite público** (link enviado no WhatsApp) |
| `/perfil`, `/entrar` | Perfil; login por celular (OTP) |

## Organização

```
src/
  app/
    (app)/        área logada, com navegação inferior
    (public)/     convite público e login
  components/
    ui/           design system (Button, fields, Avatar, VenueMark, ícones…)
    app/          componentes de domínio (MeetCard, PerkCard, ShareInvite…)
    layout/       BottomNav
  config/site.ts  marca + REGRAS COMERCIAIS (preço, 24h, limites)
  lib/
    meets/rules.ts   regras de negócio puras (preço, janela de check-in, antifraude)
    data/            contrato DartfyRepository + implementação demo
    supabase/        clientes SSR (schema "dartfy")
supabase/migrations  tabelas, RLS e funções SQL que reforçam as regras no banco
ref/                 material de referência (deck, ata, telas atuais)
```

**Regra de ouro:** telas e Server Actions só falam com `repo()` (`src/lib/data/index.ts`). Trocar demo → Supabase não mexe em nenhuma tela.

## Design system

Tokens em `src/app/globals.css` (`@theme`): fundo `noite`, superfícies `superficie/elevado`, texto `texto/suave/apagado`, acentos `neon → violeta → anil` (gradiente `bg-brand`), estados `ok/alerta/erro`. O neon é acento (CTA, foco, estado), não fundo. Tipografia: Outfit (títulos) + Plus Jakarta Sans (texto).

## Próximos passos para produção

1. **Supabase**: aplicar `supabase/migrations`, habilitar login por telefone (SMS) e criar `src/lib/data/supabase/repository.ts` implementando `DartfyRepository` sobre as funções `dartfy.*` (`create_meet`, `respond_invite`, `close_meet`, `check_in`…).
2. **Mercado Pago**: ao fechar a lista, criar o pagamento Pix pela API e gravar `external_id` e `pix_copy_paste`; rota `app/api/webhooks/mercado-pago/route.ts` validando a assinatura e chamando `dartfy.confirm_payment` com a service role.
3. **Check-in seguro**: enviar geolocalização (`check_in(p_lat, p_lng)`) e trocar o conteúdo do QR por token assinado (`src/lib/qr.ts`).
4. **Painel do bar**: cadastro de cortesias, limite diário ("controle deslizante") e leitura do QR.
5. **Notificações** (WhatsApp/push) quando a lista fecha e quando o Pix é aprovado.
