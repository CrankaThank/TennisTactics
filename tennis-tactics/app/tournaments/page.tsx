import { tournaments } from "../lib/tournaments";
import TournamentsClient from "./tournaments-client";

export default function TournamentsPage() {
  // Stable snapshot passed to the client to avoid hydration mismatch
  const nowISO = new Date().toISOString();

  return <TournamentsClient tournaments={tournaments} nowISO={nowISO} />;
}
