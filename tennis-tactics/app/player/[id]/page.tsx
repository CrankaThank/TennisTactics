import Link from "next/link";
import { players } from "../../lib/players";
import { matches } from "../../lib/matches";
import { PlayerFilters } from "../../ui/player-filters";

type ParamsLike = { id?: string } | Promise<{ id?: string }>;
type StatusFilter = "all" | "live" | "upcoming" | "finished";

function formatTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(d);
}

function statusPillClass(status: "upcoming" | "live" | "finished") {
  const base = "text-xs px-2 py-1 rounded-full border";
  if (status === "live") return `${base} border-rose-500/30 text-rose-200 bg-rose-500/10`;
  if (status === "finished") return `${base} border-emerald-500/30 text-emerald-200 bg-emerald-500/10`;
  return `${base} border-gray-600 text-gray-200 bg-white/5`;
}

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: ParamsLike;
  searchParams?: Promise<{ status?: StatusFilter; q?: string }> | { status?: StatusFilter; q?: string };
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

  const playerMatches = matches
    .filter((m) => m.p1.id === player.id || m.p2.id === player.id)
    .filter((m) => (status === "all" ? true : m.status === status))
    .filter((m) => {
      const query = q.trim().toLowerCase();
      if (!query) return true;
      const opponent = m.p1.id === player.id ? m.p2.name : m.p1.name;
      const hay = `${m.tournamentName} ${m.round} ${opponent} ${m.status}`.toLowerCase();
      return hay.includes(query);
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        {/* Header */}
        <header className="rounded-2xl bg-gray-800 p-6 shadow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white">{player.name}</h1>
              <p className="mt-1 text-gray-400">
                {player.tour} • {player.country} • Handed: {player.handed}
              </p>
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

        {/* Filters (client component) */}
        <PlayerFilters initialStatus={status} initialQuery={q} />

        {/* Match list */}
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Recent matches</h2>
            <div className="text-sm text-gray-400">
              Showing <span className="text-white">{playerMatches.length}</span>
            </div>
          </div>

          {playerMatches.length === 0 ? (
            <div className="rounded-2xl bg-gray-800 p-6 text-gray-400 shadow">
              No matches found for this player (with current filters).
            </div>
          ) : (
            playerMatches.map((m) => {
              const isP1 = m.p1.id === player.id;
              const opponent = isP1 ? m.p2 : m.p1;

              return (
                <div key={m.id} className="rounded-2xl bg-gray-800 p-5 shadow">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-gray-400">
                      {m.tour} •{" "}
                      <Link
                        href={`/tournament/${m.tournamentId}`}
                        className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
                      >
                        {m.tournamentName}
                      </Link>{" "}
                      • {m.round} • {formatTime(m.startTime)} (UTC)
                    </div>

                    <span className={statusPillClass(m.status)}>{m.status.toUpperCase()}</span>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-100 font-semibold">{player.name}</span>
                      <span className="text-gray-400 text-sm">{isP1 ? "P1" : "P2"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Link
                        href={`/player/${opponent.id}`}
                        className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
                      >
                        {opponent.name}
                      </Link>
                      <span className="text-gray-500 text-sm">{!isP1 ? "P1" : "P2"}</span>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-400">
                    {m.score ? `Score: ${m.score}` : "Score will appear here."}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
