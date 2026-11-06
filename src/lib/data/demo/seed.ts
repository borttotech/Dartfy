import type { Meet, Payment, Profile, Venue } from "@/lib/types";

/** Usuário logado no modo demo. */
export const DEMO_USER_ID = "u-thiago";

const H = 3_600_000;

/** Horário "redondo" relativo a agora, para o seed sempre parecer atual. */
function at(offsetHours: number, roundToMinutes = 30) {
  const t = Date.now() + offsetHours * H;
  const step = roundToMinutes * 60_000;
  return new Date(Math.round(t / step) * step).toISOString();
}

export function buildSeed() {
  const profiles: Profile[] = [
    { id: DEMO_USER_ID, name: "Thiago", phone: "41998848675", email: null, gender: null, birthDate: null },
    { id: "u-emerson", name: "Emerson Ribas", phone: "41991110001", email: null, gender: "masculino", birthDate: null },
    { id: "u-ana", name: "Ana Luiza", phone: "41991110002", email: null, gender: "feminino", birthDate: null },
    { id: "u-lucas", name: "Lucas Prado", phone: "41991110003", email: null, gender: "masculino", birthDate: null },
    { id: "u-bia", name: "Bia Moretti", phone: "41991110004", email: null, gender: "feminino", birthDate: null },
    { id: "u-rafa", name: "Rafa Kowalski", phone: "41991110005", email: null, gender: "outro", birthDate: null },
    { id: "u-carol", name: "Carol Tanaka", phone: "41991110006", email: null, gender: "feminino", birthDate: null },
  ];

  const allWeek = [0, 1, 2, 3, 4, 5, 6];

  const venues: Venue[] = [
    {
      id: "v-dartnight", slug: "dart-night", name: "Dart Night", category: "bar",
      address: "Pça. Santos Andrade, 50", neighborhood: "Centro", city: "Curitiba",
      tone: ["#ff2bd6", "#4f46e5"], logoUrl: null, openingHours: "Ter a dom · 18h às 2h",
      phone: "41988887777", website: null, lat: -25.4296, lng: -49.2625,
      perks: [
        { id: "p-dn-1", venueId: "v-dartnight", title: "Compre um chopp, ganhe outro", description: "Chopp pilsen 300 ml, um por pessoa confirmada.", validWeekdays: [0, 2, 3, 4], remainingToday: 18 },
        { id: "p-dn-2", venueId: "v-dartnight", title: "Partida de dardos grátis", description: "1 partida para a mesa.", validWeekdays: allWeek, remainingToday: 6 },
      ],
    },
    {
      id: "v-dartfyback", slug: "dartfy-back", name: "Dartfy Back", category: "pub",
      address: "Shopping Müller, piso L2", neighborhood: "Centro", city: "Curitiba",
      tone: ["#b91c1c", "#f97316"], logoUrl: null, openingHours: "Todos os dias · 12h às 23h",
      phone: null, website: null, lat: -25.4249, lng: -49.2672,
      perks: [{ id: "p-db-1", venueId: "v-dartfyback", title: "Porção de fritas na mesa", description: "Para grupos a partir de 3 pessoas.", validWeekdays: allWeek, remainingToday: 9 }],
    },
    {
      id: "v-cloud", slug: "cloud-bar", name: "Cloud Bar", category: "bar",
      address: "R. das Nuvens, 344", neighborhood: "Mercês", city: "Curitiba",
      tone: ["#38bdf8", "#818cf8"], logoUrl: null, openingHours: "Qua a sáb · 19h à 1h",
      phone: null, website: null, lat: -25.4234, lng: -49.2857,
      perks: [{ id: "p-cl-1", venueId: "v-cloud", title: "Drink de boas-vindas", description: "Gin tônica da casa para cada pessoa.", validWeekdays: [3, 4, 5, 6], remainingToday: 24 }],
    },
    {
      id: "v-espanha", slug: "bodega-espanha", name: "Bodega da Espanha", category: "bar",
      address: "Praça da Espanha, 12", neighborhood: "Batel", city: "Curitiba",
      tone: ["#f59e0b", "#e11d48"], logoUrl: null, openingHours: "Ter a dom · 17h à 0h",
      phone: null, website: null, lat: -25.4391, lng: -49.2858,
      perks: [{ id: "p-es-1", venueId: "v-espanha", title: "Taça de sangria", description: "Uma taça por pessoa confirmada.", validWeekdays: [2, 3, 4, 5], remainingToday: 12 }],
    },
    {
      id: "v-itupava", slug: "emporio-itupava", name: "Empório Itupava", category: "pub",
      address: "R. Itupava, 1100", neighborhood: "Alto da XV", city: "Curitiba",
      tone: ["#22c55e", "#0ea5e9"], logoUrl: null, openingHours: "Seg a sáb · 16h à 0h",
      phone: null, website: null, lat: -25.4219, lng: -49.2488,
      perks: [{ id: "p-it-1", venueId: "v-itupava", title: "Chopp artesanal 300 ml", description: "IPA ou Lager da casa, um por pessoa.", validWeekdays: allWeek, remainingToday: 30 }],
    },
    {
      id: "v-frutos", slug: "seu-frutos-do-mar", name: "Seu Frutos do Mar", category: "restaurante",
      address: "Av. Mateus Leme, 2200", neighborhood: "São Lourenço", city: "Curitiba",
      tone: ["#06b6d4", "#2563eb"], logoUrl: null, openingHours: "Ter a dom · 11h às 23h",
      phone: null, website: null, lat: -25.3933, lng: -49.2678,
      perks: [{ id: "p-fm-1", venueId: "v-frutos", title: "Entrada de bolinho de bacalhau", description: "Porção com 6 unidades para a mesa.", validWeekdays: [2, 3, 4], remainingToday: 0 }],
    },
  ];

  const meets: Meet[] = [
    // Convite recebido, ainda sem resposta (tela "convite recebido").
    {
      id: "m-emerson", code: "emr7sab", hostId: "u-emerson", venueId: "v-dartfyback",
      startsAt: at(50), message: "Happy hour de sexta, quem colar ganha fritas 🍟", status: "open", createdAt: at(-20),
      guests: [
        { userId: "u-emerson", role: "host", status: "accepted", respondedAt: at(-20), checkedInAt: null },
        { userId: "u-ana", role: "guest", status: "accepted", respondedAt: at(-10), checkedInAt: null },
        { userId: "u-lucas", role: "guest", status: "accepted", respondedAt: at(-8), checkedInAt: null },
        { userId: DEMO_USER_ID, role: "guest", status: "invited", respondedAt: null, checkedInAt: null },
      ],
    },
    // Meet do Thiago como anfitrião, lista aberta.
    {
      id: "m-thiago", code: "thg22dn", hostId: DEMO_USER_ID, venueId: "v-dartnight",
      startsAt: at(30), message: null, status: "open", createdAt: at(-3),
      guests: [
        { userId: DEMO_USER_ID, role: "host", status: "accepted", respondedAt: at(-3), checkedInAt: null },
        { userId: "u-bia", role: "guest", status: "accepted", respondedAt: at(-2), checkedInAt: null },
        { userId: "u-rafa", role: "guest", status: "declined", respondedAt: at(-1), checkedInAt: null },
      ],
    },
    // Meet pago acontecendo agora: check-in liberado.
    {
      id: "m-carol", code: "crl9itp", hostId: "u-carol", venueId: "v-itupava",
      startsAt: at(0.5, 15), message: "Aniversário da Carol 🎂", status: "paid", createdAt: at(-48),
      guests: [
        { userId: "u-carol", role: "host", status: "accepted", respondedAt: at(-48), checkedInAt: null },
        { userId: DEMO_USER_ID, role: "guest", status: "accepted", respondedAt: at(-40), checkedInAt: null },
        { userId: "u-bia", role: "guest", status: "accepted", respondedAt: at(-30), checkedInAt: null },
        { userId: "u-lucas", role: "guest", status: "checked_in", respondedAt: at(-30), checkedInAt: at(0, 5) },
      ],
    },
    // Histórico.
    {
      id: "m-old", code: "old4cld", hostId: DEMO_USER_ID, venueId: "v-cloud",
      startsAt: at(-24 * 9), message: null, status: "finished", createdAt: at(-24 * 11),
      guests: [
        { userId: DEMO_USER_ID, role: "host", status: "checked_in", respondedAt: at(-24 * 11), checkedInAt: at(-24 * 9) },
        { userId: "u-ana", role: "guest", status: "checked_in", respondedAt: at(-24 * 10), checkedInAt: at(-24 * 9) },
        { userId: "u-emerson", role: "guest", status: "checked_in", respondedAt: at(-24 * 10), checkedInAt: at(-24 * 9) },
      ],
    },
  ];

  const payments: Payment[] = [
    { id: "pay-carol", meetId: "m-carol", amountCents: 499, people: 4, status: "approved", pixCopyPaste: "", createdAt: at(-5), paidAt: at(-5) },
    { id: "pay-old", meetId: "m-old", amountCents: 499, people: 3, status: "approved", pixCopyPaste: "", createdAt: at(-24 * 9.5), paidAt: at(-24 * 9.5) },
  ];

  return { profiles, venues, meets, payments };
}
