import Link from "next/link";
import { tournaments } from "../../lib/tournaments";
import { matches } from "../../lib/matches";
import { MatchCard } from "../../ui/match-card";

function formatRange(start: string, end: string) {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
  return `${fmt.format(s)} – ${fmt.format(e)}`;
}

export default function TournamentPage({ params }: { params: { id: string } }) {
  const t = tournaments.find((x) => x.id === params.id);

  if (!t) {
    return (
      <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl bg-gray-800 p-6 shadow">
            <h1 className="text-xl font-semibold text-white">Tournament not found</h1>
            <Link
              href="/tournaments"
              className="mt-3 inline-block text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
            >
              ← Back to tournaments
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const tournamentMatches = matches
    .filter((m) => m.tournamentId === t.id)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const live = tournamentMatches.filter((m) => m.status === "live");
  const upcoming = tournamentMatches.filter((m) => m.status === "upcoming");
  const finished = tournamentMatches.filter((m) => m.status === "finished").reverse(); // newest first

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
              <p className="mt-2 text-sm text-gray-500">
                {formatRange(t.startDate, t.endDate)} (UTC)
              </p>
            </div>

            <Link
              href="/tournaments"
              className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition whitespace-nowrap"
            >
              ← Tournaments
            </Link>
          </div>
        </header>

        {/* Matches */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Matches</h2>
            <div className="text-sm text-gray-400">
              Total: <span className="text-white">{tournamentMatches.length}</span>
            </div>
          </div>

          {tournamentMatches.length === 0 ? (
            <div className="rounded-2xl bg-gray-800 p-6 text-gray-400 shadow">
              No matches for this tournament yet (sample data).
            </div>
          ) : (
            <div className="space-y-6">
              {live.length ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold tracking-wide text-gray-300">LIVE</h3>
                  {live.map((m) => (
                    <MatchCard key={m.id} match={m} variant="tournament" />
                  ))}
                </div>
              ) : null}

              {upcoming.length ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold tracking-wide text-gray-300">UPCOMING</h3>
                  {upcoming.map((m) => (
                    <MatchCard key={m.id} match={m} variant="tournament" />
                  ))}
                </div>
              ) : null}

              {finished.length ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold tracking-wide text-gray-300">FINISHED</h3>
                  {finished.map((m) => (
                    <MatchCard key={m.id} match={m} variant="tournament" />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
