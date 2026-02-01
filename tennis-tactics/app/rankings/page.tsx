import { rankings, type Tour } from "../lib/rankings";
import RankingsClient from "./rankings-client";

type SearchParamsLike = { tour?: string } | Promise<{ tour?: string }>;

export default async function RankingsPage({ searchParams }: { searchParams?: SearchParamsLike }) {
  const resolved = await Promise.resolve(searchParams as any);
  const qp = typeof resolved?.tour === "string" ? resolved.tour.toUpperCase() : "";

  const initialTour: Tour = qp === "WTA" ? "WTA" : "ATP";

  return <RankingsClient rankings={rankings} initialTour={initialTour} />;
}
