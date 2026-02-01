import Link from "next/link";
import { tournaments } from "../../lib/tournaments";
import { matches, type Match } from "../../lib/matches";
import TournamentDrawClient from "./tournament-draw-client";

function formatRange(start: string, end: string) {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
  return `${fmt.format(s)} – ${fmt.format(e)}`;
}

type ParamsLike = { id?: string } | Promise<{ id?: string }>;

export default async function TournamentPage({ params }: { params: ParamsLike }) {
  const resolvedParams = await Promise.resolve(params as any);
  const id = typeof resolvedParams?.id === "string" ? resolvedParams.id : "";

  const t = tournaments.find((x) => x.id === id);

  // If tournament not found, show debug + exit early
  if (!t) {
    const available = tournaments.map((x) => x.id).slice(0, 30);
    return (
      <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl bg-gray-800 p-6 shadow space-y-4">
            <h1 className="text-xl font-semibold text-white">Tournament not found</h1>
            <p className="text-gray-400">
              Requested id: <span className="font-mono text-gray-200">{id || "(missing)"}</span>
            </p>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[11px] uppercase tracking-wide text-gray-500">
                Available tournament ids (first {available.length})
              </div>
              <div className="mt-2 text-sm text-gray-200 font-mono break-words">
                {available.join(", ")}
              </div>
            </div>

            <Link
              href="/tournaments"
              className="inline-block text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition cursor-pointer"
            >
              ← Back to tournaments
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ✅ FIX: only include matches that belong to this tournament AND match the tour (ATP/WTA)
  const tournamentMatches: Match[] = matches
    .filter((m) => m.tournamentId === t.id)
    .filter((m) => m.tour === t.tour)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        {/* Header */}
        <header className="rounded-2xl bg-gray-800 p-6 shadow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white">{t.name}</h1>
              <p className="mt-1 text-gray-400">
                {t.tour} • {t.location} • {t.surface} • {t.level}
              </p>
              <p className="mt-2 text-sm text-gray-500">{formatRange(t.startDate, t.endDate)} (UTC)</p>
            </div>

            <Link
              href="/tournaments"
              className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition whitespace-nowrap cursor-pointer"
            >
              ← Tournaments
            </Link>
          </div>
        </header>

        {/* Draw View */}
        <TournamentDrawClient tournamentId={t.id} tournamentMatches={tournamentMatches} />
      </div>
    </main>
  );
}
