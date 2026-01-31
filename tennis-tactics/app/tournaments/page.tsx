import Link from "next/link";
import { tournaments } from "../lib/tournaments";

export default function TournamentsPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        <header>
          <h1 className="text-3xl font-semibold text-white">Tournaments</h1>
          <p className="text-gray-400">Browse tournaments (sample data for now).</p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/tournament/${t.id}`}
              className="rounded-2xl bg-gray-800 p-5 shadow hover:bg-gray-700 transition block"
            >
              <div className="flex justify-between gap-3">
                <div className="font-semibold text-white">{t.name}</div>
                <div className="text-sm text-gray-400">{t.tour}</div>
              </div>
              <div className="mt-1 text-sm text-gray-400">
                {t.location} • {t.surface} • {t.level}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
