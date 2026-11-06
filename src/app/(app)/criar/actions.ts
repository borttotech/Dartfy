"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { zonedIso } from "@/lib/format";
import { optStr, str } from "@/lib/forms";
import { DomainError } from "@/lib/meets/rules";
import type { ActionState } from "@/lib/types";

export async function createMeetAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser("/criar");
  const venueId = str(form, "venueId");
  const date = str(form, "date");
  const time = str(form, "time");
  const message = optStr(form, "message")?.slice(0, 140) ?? null;

  if (!venueId) return { ok: false, message: "Escolha um local.", fieldErrors: { venueId: "Escolha um local." } };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
    return { ok: false, message: "Escolha dia e horário.", fieldErrors: { startsAt: "Escolha dia e horário." } };

  let meetId: string;
  try {
    const meet = await repo().createMeet({ hostId: user.id, venueId, startsAt: zonedIso(date, time), message });
    meetId = meet.id;
  } catch (e) {
    if (e instanceof DomainError) return { ok: false, message: e.message, fieldErrors: e.field ? { [e.field]: e.message } : undefined };
    throw e;
  }

  revalidatePath("/", "layout");
  redirect(`/meets/${meetId}?novo=1`);
}
