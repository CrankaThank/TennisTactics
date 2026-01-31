import Link from "next/link";
import { tournaments } from "../../lib/tournaments";
import { matches } from "../../lib/matches";

export default function TournamentPage({ params }: { params: { id: string } }) {
  const t = tournaments.find((x) => x.id === params.id);

  if (!t) {
    return (
      <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl bg-gray-800 p-6">
            <h1 className="text-xl font-semibold text-white">Tournament not found</h1>
            <Link href="/tournaments" className="mt-3 inline-block text-gray-300 hover:text-white">
              ← Back to tournaments
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const tournamentMatches = matches.filter((m) => m.tournamentId === t.id);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        <header className="rounded-2xl bg-gray-800 p-6 shadow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white">{t.name}</h1>
              <p className="text-gray-400">
                {t.tour} • {t.location} • {t.surface} • {t.level}
              </p>
            </div>
            <Link href="/tournaments" className="text-gray-300 hover:text-white">
              ← Tournaments
            </Link>
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Matches</h2>

          {tournamentMatches.length === 0 ? (
            <div className="rounded-2xl bg-gray-800 p-6 text-gray-400">
              No matches yet (sample data).
            </div>
          ) : (
            tournamentMatches.map((m) => (
              <div key={m.id} className="rounded-2xl bg-gray-800 p-5 shadow">
                <div className="text-sm text-gray-400">
                  {m.round} • {m.status.toUpperCase()}
                </div>

                <div className="mt-3 grid gap-2">
                  <div className="flex items-center justify-between">
                    <Link href={`/player/${m.p1.id}`} className="hover:text-white text-gray-200">
                      {m.p1.name}
                    </Link>
                  </div>
                  <div className="flex items-center justify-between">
                    <Link href={`/player/${m.p2.id}`} className="hover:text-white text-gray-200">
                      {m.p2.name}
                    </Link>
                  </div>
                </div>

                <div className="mt-3 text-gray-400 text-sm">
                  {m.score ? `Score: ${m.score}` : "Score will appear here."}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
