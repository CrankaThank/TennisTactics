import Link from "next/link";
import { players } from "../../lib/players";
import { matches } from "../../lib/matches";
import { PlayerFilters } from "../../ui/player-filters";
import { MatchCard } from "../../ui/match-card";

type ParamsLike = { id?: string } | Promise<{ id?: string }>;
type StatusFilter = "all" | "live" | "upcoming" | "finished";

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: ParamsLike;
  searchParams?:
    | Promise<{ status?: StatusFilter; q?: string }>
    | { status?: StatusFilter; q?: string };
}) {
  const resolvedParams = await Promise.resolve(params as any);
  const id = typeof resolvedParams?.id === "string" ? resolvedParams.id : "";

  const resolvedSearch = await Promise.resolve(searchParams as any);
  const status = (resolvedSearch?.status ?? "all") as StatusFilter;
  const q = typeof resolvedSearch?.q === "string" ? resolvedSearch.q : "";

  const player = players.find((p) => p.id === id);

  if (!player) {
    return (
      <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
        <div className="mx-auto max-w-5xl px-6 space-y-6">
          <header className="rounded-2xl bg-gray-800 p-6 shadow">
            <h1 className="text-2xl font-semibold text-white">Player not found</h1>
            <p className="mt-2 text-gray-400">
              We couldn’t find a player with id:{" "}
              <span className="text-gray-200 font-mono">{id || "(missing id)"}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <Link
                href="/players"
                className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                ← Back to players
              </Link>
              <Link
                href="/rankings"
                className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                View rankings
              </Link>
            </div>
          </header>
        </div>
      </main>
    );
  }

  const allPlayerMatches = matches
    .filter((m) => m.p1.id === player.id || m.p2.id === player.id)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const last10Finished = allPlayerMatches.filter((m) => m.status === "finished").slice(0, 10);

  const last10 = last10Finished.reduce(
    (acc, m) => {
      if (!m.winnerId) return acc;
      if (m.winnerId === player.id) acc.w += 1;
      else acc.l += 1;
      return acc;
    },
    { w: 0, l: 0 }
  );

  const playerMatches = allPlayerMatches
    .filter((m) => (status === "all" ? true : m.status === status))
    .filter((m) => {
      const query = q.trim().toLowerCase();
      if (!query) return true;
      const opponent = m.p1.id === player.id ? m.p2.name : m.p1.name;
      const hay = `${m.tournamentName} ${m.round} ${opponent} ${m.status}`.toLowerCase();
      return hay.includes(query);
    });

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        {/* Header */}
        <header className="rounded-2xl bg-gray-800 p-6 shadow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white">{player.name}</h1>
              <p className="mt-1 text-gray-400">
                {player.tour} • {player.country} • Handed: {player.handed}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-gray-400">Last 10 (finished):</span>
                <span className="text-white font-semibold tabular-nums">
                  {last10.w}-{last10.l}
                </span>
                <span className="text-gray-500">(W-L)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/players"
                className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition whitespace-nowrap"
              >
                ← Players
              </Link>
              <Link
                href="/rankings"
                className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition whitespace-nowrap"
              >
                Rankings
              </Link>
            </div>
          </div>
        </header>

        {/* Filters */}
        <PlayerFilters initialStatus={status} initialQuery={q} />

        {/* Match list */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Matches</h2>
            <div className="text-sm text-gray-400">
              Showing <span className="text-white">{playerMatches.length}</span>
            </div>
          </div>

          {playerMatches.length === 0 ? (
            <div className="rounded-2xl bg-gray-800 p-6 text-gray-400 shadow">
              No matches found for this player (with current filters).
            </div>
          ) : (
            <div className="space-y-3">
              {playerMatches.map((m) => (
                <MatchCard key={m.id} match={m} variant="player" highlightPlayerId={player.id} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
