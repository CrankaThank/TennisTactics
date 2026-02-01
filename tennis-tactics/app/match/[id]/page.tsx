import Link from "next/link";
import { matches } from "../../lib/matches";
import { tournaments } from "../../lib/tournaments";
import { LivePointsSim } from "../../ui/live-points-sim";

type ParamsLike = { id?: string } | Promise<{ id?: string }>;

function formatTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(d);
}

function statusPill(status: "upcoming" | "live" | "finished") {
  const base =
    "inline-flex items-center justify-center h-7 px-3 rounded-full border text-[11px] font-semibold tracking-wide leading-none";
  if (status === "live") return `${base} border-rose-500/35 text-rose-100 bg-rose-500/15`;
  if (status === "finished") return `${base} border-emerald-500/35 text-emerald-100 bg-emerald-500/15`;
  return `${base} border-sky-500/30 text-sky-100 bg-sky-500/12`;
}

function chip() {
  return [
    "cursor-pointer select-none",
    "inline-flex items-center justify-center h-9 px-4 rounded-full",
    "border border-white/10 bg-white/[0.03]",
    "text-sm text-gray-200 hover:text-white",
    "hover:border-white/20 transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
  ].join(" ");
}

function subtleCard() {
  return "rounded-2xl border border-gray-700 bg-gray-900/40 p-4";
}

function miniStatLabel() {
  return "text-[11px] uppercase tracking-wide text-gray-500";
}

function miniStatValue() {
  return "mt-1 text-xl font-semibold text-white tabular-nums";
}

function h2hHref(tour: string, p1: string, p2: string) {
  // stable ordering so the same pair always yields the same URL
  const a = p1 < p2 ? p1 : p2;
  const b = p1 < p2 ? p2 : p1;
  return `/h2h?tour=${encodeURIComponent(tour)}&p1=${encodeURIComponent(a)}&p2=${encodeURIComponent(b)}`;
}

export default async function MatchPage({ params }: { params: ParamsLike }) {
  const resolved = await Promise.resolve(params as any);
  const id = typeof resolved?.id === "string" ? resolved.id : "";

  const m = matches.find((x) => x.id === id);

  if (!m) {
    return (
      <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl bg-gray-800 p-6 shadow space-y-3">
            <h1 className="text-2xl font-semibold text-white">Match not found</h1>
            <p className="text-gray-400">
              Requested id: <span className="font-mono text-gray-200">{id || "(missing)"}</span>
            </p>
            <Link
              href="/matches"
              className="cursor-pointer text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
            >
              ← Back to matches
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const t = tournaments.find((x) => x.id === m.tournamentId);

  // Points are optional in your sample data + not in the Match TS type.
  // Read them safely without TS errors.
  const initialPoints = ((m as any).points ?? []) as any[];

  // Basic “snapshot” values (kept stable & honest even without full stat engine yet)
  const hasScore = !!m.score;
  const metaLine = `${m.tour} • ${m.tournamentName} • ${m.round} • ${formatTime(m.startTime)} (UTC)${
    t?.surface ? ` • ${t.surface}` : ""
  }`;

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        {/* Match Center header */}
        <header className="rounded-2xl bg-gray-800 p-6 shadow space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={statusPill(m.status)}>{m.status.toUpperCase()}</span>
                <span className="text-xs text-gray-500">UTC</span>
              </div>

              <h1 className="text-3xl font-semibold text-white break-words">
                {m.p1.name} <span className="text-gray-500 font-medium">vs</span> {m.p2.name}
              </h1>

              <p className="text-gray-400">
                {m.tour} •{" "}
                <Link
                  href={`/tournament/${m.tournamentId}`}
                  className="cursor-pointer text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
                >
                  {m.tournamentName}
                </Link>{" "}
                • {m.round}
              </p>

              <p className="text-sm text-gray-500">{metaLine}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/tournament/${m.tournamentId}`}
                className="cursor-pointer text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition whitespace-nowrap"
              >
                View tournament →
              </Link>
            </div>
          </div>

          {/* Top “score strip” */}
          <div className={subtleCard()}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-gray-400">
                {hasScore ? (
                  <>
                    <span className="text-gray-400">Score:</span>{" "}
                    <span className="text-white font-semibold tabular-nums">{m.score}</span>
                  </>
                ) : (
                  <span className="text-gray-500">
                    {m.status === "upcoming"
                      ? "Scheduled (no score yet)."
                      : m.status === "live"
                      ? "Live score will appear here."
                      : "Final score unavailable."}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href={h2hHref(m.tour, m.p1.id, m.p2.id)} className={chip()}>
                  H2H
                </Link>
                <Link href={`/player/${m.p1.id}`} className={chip()}>
                  {m.p1.name}
                </Link>
                <Link href={`/player/${m.p2.id}`} className={chip()}>
                  {m.p2.name}
                </Link>
              </div>
            </div>
          </div>

          {/* Quick stats (placeholder now, but layout-ready) */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className={miniStatLabel()}>Tournament</div>
              <div className="mt-1 text-sm text-gray-200 truncate">{m.tournamentName}</div>
              <div className="mt-1 text-xs text-gray-500">{m.round}</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className={miniStatLabel()}>{m.status === "finished" ? "Result" : "Status"}</div>
              <div className={miniStatValue()}>
                {m.status === "finished" ? (m.winnerId ? "Completed" : "Finished") : m.status.toUpperCase()}
              </div>
              <div className="mt-1 text-xs text-gray-500">Snapshot (sample data)</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className={miniStatLabel()}>Surface</div>
              <div className={miniStatValue()}>{t?.surface ?? "—"}</div>
              <div className="mt-1 text-xs text-gray-500">{t?.level ?? ""}</div>
            </div>
          </div>
        </header>

        {/* Live Match Center (simulation + score UI + score by set + point feed) */}
        <LivePointsSim
          initialPoints={initialPoints}
          p1Name={m.p1.name}
          p2Name={m.p2.name}
          enabled={m.status === "live"}
          intervalMs={2000}
          bestOf={3}
        />
      </div>
    </main>
  );
}
