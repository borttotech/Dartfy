import type { Metadata } from "next";
import { repo } from "@/lib/data";
import { CreateMeetWizard } from "./CreateMeetWizard";

export const metadata: Metadata = { title: "Criar meet" };

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ local?: string }> }) {
  const [{ local }, venues] = await Promise.all([searchParams, repo().listVenues()]);
  return <CreateMeetWizard venues={venues} initialVenueId={venues.some((v) => v.id === local) ? local! : null} />;
}
