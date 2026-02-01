import Link from "next/link";
import { players } from "../../lib/players";
import { matches } from "../../lib/matches";
import { tournaments } from "../../lib/tournaments";
import { rankings } from "../../lib/rankings";
import { PlayerFilters } from "../../ui/player-filters";
import { MatchCard } from "../../ui/match-card";

type ParamsLike = { id?: string } | Promise<{ id?: string }>;
type StatusFilter = "all" | "live" | "upcoming" | "finished";

type SurfaceKey = "Hard" | "Clay" | "Grass";

function normalizeSurface(surfaceRaw: string): SurfaceKey | null {
  const s = (surfaceRaw || "").toLowerCase();
  if (s.includes("clay")) return "Clay";
  if (s.includes("grass")) return "Grass";
  if (s.includes("hard")) return "Hard";
  return null; // ignore anything else
}

function pct(w: number, total: number) {
  if (total <= 0) return "—";
  return `${Math.round((w / total) * 1000) / 10}%`;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

function statCard(label: string, value: string, sub?: string) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white tabular-nums">{value}</div>
      {sub ? <div className="mt-1 text-xs text-gray-500">{sub}</div> : null}
    </div>
  );
}

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
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl bg-gray-800 p-6 shadow">
            Player not found
          </div>
        </div>
      </main>
    );
  }

  const tournamentById = new Map(tournaments.map((t) => [t.id, t]));

  const allPlayerMatches = matches
    .filter((m) => m.p1.id === player.id || m.p2.id === player.id)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const finished = allPlayerMatches.filter((m) => m.status === "finished" && !!m.winnerId);

  const career = finished.reduce(
    (acc, m) => {
      if (!m.winnerId) return acc;

      acc.played++;
      if (m.winnerId === player.id) acc.w++;
      else acc.l++;

      const surfRaw = tournamentById.get(m.tournamentId)?.surface ?? "";
      const surf = normalizeSurface(surfRaw);

      if (surf) {
        const bucket = acc.surface[surf];
        bucket.played++;
        if (m.winnerId === player.id) bucket.w++;
        else bucket.l++;
      }

      return acc;
    },
    {
      played: 0,
      w: 0,
      l: 0,
      surface: {
        Hard: { played: 0, w: 0, l: 0 },
        Clay: { played: 0, w: 0, l: 0 },
        Grass: { played: 0, w: 0, l: 0 },
      } as Record<SurfaceKey, { played: number; w: number; l: number }>,
    }
  );

  const last10Finished = finished.slice(0, 10);
  const last10 = last10Finished.reduce(
    (acc, m) => {
      if (m.winnerId === player.id) acc.w++;
      else acc.l++;
      return acc;
    },
    { w: 0, l: 0 }
  );

  const rankingRow = rankings.find((r) => r.playerId === player.id);

  const playerMatches = allPlayerMatches
    .filter((m) => (status === "all" ? true : m.status === status))
    .filter((m) => {
      const query = q.trim().toLowerCase();
      if (!query) return true;
      const opponent = m.p1.id === player.id ? m.p2.name : m.p1.name;
      const hay = `${m.tournamentName} ${opponent}`.toLowerCase();
      return hay.includes(query);
    });

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        {/* Header */}
        <header className="rounded-2xl bg-gray-800 p-6 shadow">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center font-semibold">
              {initials(player.name)}
            </div>

            <div>
              <h1 className="text-3xl font-semibold">{player.name}</h1>
              <p className="text-gray-400">
                {player.tour} • {player.country} • Handed: {player.handed}
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Last 10 (W/L):{" "}
                <span className="text-white font-semibold">
                  {last10.w}-{last10.l}
                </span>
              </p>
            </div>
          </div>

          {/* Career stats */}
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {statCard("Matches", String(career.played))}
            {statCard("Wins", String(career.w), pct(career.w, career.played))}
            {statCard("Losses", String(career.l))}
            {statCard("Rank", rankingRow ? `#${rankingRow.rank}` : "—")}
          </div>

          {/* Surface record */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-xs text-gray-500 mb-3">Surface record (finished)</div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(Object.keys(career.surface) as SurfaceKey[]).map((s) => {
                const b = career.surface[s];
                return (
                  <div key={s} className="rounded-xl border border-white/10 p-3">
                    <div className="text-xs text-gray-400">{s}</div>
                    <div className="text-white font-semibold">
                      {b.w}-{b.l}
                    </div>
                    <div className="text-xs text-gray-500">
                      {pct(b.w, b.played)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        <PlayerFilters initialStatus={status} initialQuery={q} />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Matches</h2>

          {playerMatches.map((m) => (
            <MatchCard key={m.id} match={m} variant="player" highlightPlayerId={player.id} />
          ))}
        </section>
      </div>
    </main>
  );
}
