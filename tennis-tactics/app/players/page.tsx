import Link from "next/link";
import { players } from "../lib/players";
export default function PlayersPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-3xl font-semibold text-white">Players</h1>
          <p className="text-gray-400">Browse player profiles.</p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {players.map((p) => (
            <Link
              key={p.id}
              href={`/player/${p.id}`}
              className="rounded-2xl bg-gray-800 p-5 shadow hover:bg-gray-700 transition"
            >
              <div className="flex justify-between">
                <div className="font-semibold text-white">{p.name}</div>
                <div className="text-sm text-gray-400">{p.tour}</div>
              </div>
              <div className="text-sm text-gray-400">
                {p.country} • Handed: {p.handed}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
