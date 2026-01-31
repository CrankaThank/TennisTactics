import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            TennisTactics
          </h1>
          <p className="text-gray-400">Modern tennis stats and insights.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/matches"
            className="block rounded-2xl bg-gray-800 p-5 shadow hover:bg-gray-700 transition"
          >
            <h2 className="text-lg font-semibold text-white">Today’s Matches</h2>
            <p className="mt-2 text-gray-400">
              Upcoming and live matches will appear here.
            </p>
          </Link>

          <Link
            href="/rankings"
            className="block rounded-2xl bg-gray-800 p-5 shadow hover:bg-gray-700 transition"
          >
            <h2 className="text-lg font-semibold text-white">Rankings</h2>
            <p className="mt-2 text-gray-400">
              ATP & WTA rankings updated regularly.
            </p>
          </Link>

          <Link
            href="/tournaments"
            className="block rounded-2xl bg-gray-800 p-5 shadow hover:bg-gray-700 transition"
          >
            <h2 className="text-lg font-semibold text-white">Tournaments</h2>
            <p className="mt-2 text-gray-400">
              Browse tournaments, draws, and results.
            </p>
          </Link>

          <Link
            href="/players"
            className="block rounded-2xl bg-gray-800 p-5 shadow hover:bg-gray-700 transition"
          >
            <h2 className="text-lg font-semibold text-white">Players</h2>
            <p className="mt-2 text-gray-400">
              Browse player profiles, form, and surface stats.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
