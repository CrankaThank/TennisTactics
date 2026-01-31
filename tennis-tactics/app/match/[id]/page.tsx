import Link from "next/link";
import { matches } from "../../lib/matches";
import { LivePointsSim } from "../../ui/live-points-sim";

type ParamsLike = { id?: string } | Promise<{ id?: string }>;

type SetScore = {
  p1: number;
  p2: number;
  // tie-break points shown as (x). Convention: it’s shown for the loser of the set.
  tb?: number;
  tbLoser?: "p1" | "p2";
};

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

function statusPillClass(status: "upcoming" | "live" | "finished") {
  const base = "text-xs px-2 py-1 rounded-full border";
  if (status === "live") return `${base} border-rose-500/30 text-rose-200 bg-rose-500/10`;
  if (status === "finished") return `${base} border-emerald-500/30 text-emerald-200 bg-emerald-500/10`;
  return `${base} border-gray-600 text-gray-200 bg-white/5`;
}

/**
 * Supports:
 * - "7-6(5) 6-4 6-2"
 * - "6-7(8) 6-3 10-8" (super-tiebreak treated like a normal set for display)
 */
function parseScore(score?: string): SetScore[] | null {
  if (!score) return null;
  const parts = score.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return null;

  const sets: SetScore[] = [];

  for (const part of parts) {
    // e.g. 7-6(5) or 6-7(8) or 10-8
    const m = part.match(/^(\d+)-(\d+)(?:\((\d+)\))?$/);
    if (!m) return null;

    const p1 = Number(m[1]);
    const p2 = Number(m[2]);
    const tb = m[3] ? Number(m[3]) : undefined;

    if (!Number.isFinite(p1) || !Number.isFinite(p2)) return null;

    const set: SetScore = { p1, p2 };

    if (tb !== undefined && Number.isFinite(tb)) {
      set.tb = tb;
      // Tie-break number in notation is shown for the LOSER of the set
      if (p1 > p2) set.tbLoser = "p2";
      else if (p2 > p1) set.tbLoser = "p1";
      else set.tbLoser = undefined;
    }

    sets.push(set);
  }

  return sets.length ? sets : null;
}

function winnerBadge() {
  return (
    <span className="inline-flex items-center justify-center h-7 px-3 rounded-full border border-emerald-300/50 bg-emerald-500/30 text-emerald-100 text-[11px] font-semibold tracking-wide leading-none">
      WINNER
    </span>
  );
}

function buildGridTemplate(setCount: number, showResult: boolean) {
  // fixed columns for perfect alignment; mobile handles it via horizontal scroll container
  const setCols = Array.from({ length: setCount }, () => "72px").join(" ");
  const resultCol = showResult ? "140px" : "0px";
  return `minmax(240px, 1fr) ${setCols} ${resultCol}`.trim();
}

function scorePillClass(isHigher: boolean) {
  // rounded like the winner pill, centered content, consistent height
  return [
    "h-9 w-[72px]",
    "rounded-full border",
    "tabular-nums text-sm font-semibold",
    "inline-flex items-center justify-center gap-1",
    "leading-none",
    isHigher
      ? "bg-white/10 text-white border-white/20"
      : "bg-white/[0.04] text-gray-200 border-white/12",
  ].join(" ");
}

function rowClass(isWinner: boolean) {
  // obvious winner row background + left accent, but still subtle & premium
  return [
    "rounded-xl border px-4 py-3",
    "min-h-[58px]",
    isWinner
      ? "border-emerald-400/45 bg-emerald-500/18 shadow-[inset_4px_0_0_0_rgba(16,185,129,0.55)]"
      : "border-white/10 bg-white/[0.02]",
  ].join(" ");
}

function playerLinkClass() {
  return "min-w-0 truncate text-gray-100 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition font-semibold";
}

function ResultSlot({ isWinner }: { isWinner: boolean }) {
  // fixed height so both rows are identical height even if one has WINNER
  return (
    <div className="flex justify-end items-center h-9">
      {isWinner ? winnerBadge() : <span className="text-xs text-gray-600">—</span>}
    </div>
  );
}

function ScorePill({
  games,
  tbShown,
  isHigher,
}: {
  games: number;
  tbShown?: number;
  isHigher: boolean;
}) {
  return (
    <div className={scorePillClass(isHigher)} aria-label={tbShown ? `${games} tie-break ${tbShown}` : `${games}`}>
      <span className="text-center">{games}</span>
      {tbShown !== undefined ? (
        <span className="text-[11px] text-gray-200/90 font-semibold">({tbShown})</span>
      ) : null}
    </div>
  );
}

export default async function MatchPage({ params }: { params: ParamsLike }) {
  const resolvedParams = await Promise.resolve(params as any);
  const id = typeof resolvedParams?.id === "string" ? resolvedParams.id : "";

  const m = matches.find((x) => x.id === id);

  if (!m) {
    return (
      <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl bg-gray-800 p-6 shadow space-y-3">
            <h1 className="text-2xl font-semibold text-white">Match Not Found</h1>
            <p className="text-gray-400">
              We couldn’t find a match with id:{" "}
              <span className="font-mono text-gray-200">{id || "(missing id)"}</span>
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/matches"
                className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                ← Back to Matches
              </Link>
              <Link
                href="/tournaments"
                className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                Browse Tournaments
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const isFinished = m.status === "finished";
  const p1Winner = isFinished && m.winnerId === m.p1.id;
  const p2Winner = isFinished && m.winnerId === m.p2.id;

  const sets = parseScore(m.score);
  const setCount = sets ? sets.length : 0;
  const gridTemplateColumns = buildGridTemplate(setCount, isFinished);

  const showLivePoints = m.status === "live" && Array.isArray(m.livePoints) && m.livePoints.length > 0;

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        {/* Top nav */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href="/matches"
              className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
            >
              ← Matches
            </Link>
            <Link
              href={`/tournament/${m.tournamentId}`}
              className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
            >
              Tournament
            </Link>
          </div>

          <span className={statusPillClass(m.status)}>{m.status.toUpperCase()}</span>
        </div>

        {/* Header */}
        <header className="rounded-2xl bg-gray-800 p-6 shadow space-y-2">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
              {m.p1.name} <span className="text-gray-500 font-medium">vs</span> {m.p2.name}
            </h1>

            <p className="text-gray-400">
              {m.tour} •{" "}
              <Link
                href={`/tournament/${m.tournamentId}`}
                className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                {m.tournamentName}
              </Link>{" "}
              • {m.round}
            </p>

            <p className="text-sm text-gray-500">{formatTime(m.startTime)} (UTC)</p>
          </div>

          {/* Score strip */}
          <div className="pt-3">
            <div className="rounded-2xl bg-gray-900/60 border border-gray-700 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-400">
                  {m.score ? (
                    <>
                      <span className="text-gray-400">Score:</span>{" "}
                      <span className="text-white font-medium">{m.score}</span>
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

                <Link
                  href={`/tournament/${m.tournamentId}`}
                  className="text-sm text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
                >
                  View tournament →
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Score By Set */}
        <section className="rounded-2xl bg-gray-800 p-6 shadow space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Score By Set</h2>
            <div className="text-sm text-gray-500">UTC timing • set breakdown</div>
          </div>

          {sets ? (
            <div className="rounded-2xl border border-gray-700 bg-gray-900/40 p-4">
              {/* MOBILE/RESPONSIVE: allow horizontal scroll if needed */}
              <div className="overflow-x-auto -mx-2 px-2">
                <div className="min-w-[640px]">
                  {/* Header row */}
                  <div
                    className="grid items-center gap-3 px-1 pb-2 border-b border-white/6"
                    style={{ gridTemplateColumns }}
                  >
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">Player</div>

                    {sets.map((_, i) => (
                      <div
                        key={i}
                        className="text-[11px] uppercase tracking-wide text-gray-500 text-center"
                      >
                        S{i + 1}
                      </div>
                    ))}

                    <div className="text-[11px] uppercase tracking-wide text-gray-500 text-right pr-1">
                      {isFinished ? "Result" : ""}
                    </div>
                  </div>

                  {/* Rows */}
                  <div className="pt-4 space-y-3">
                    {/* P1 */}
                    <div className={rowClass(p1Winner)}>
                      <div className="grid items-center gap-3" style={{ gridTemplateColumns }}>
                        <Link href={`/player/${m.p1.id}`} className={playerLinkClass()} title={m.p1.name}>
                          {m.p1.name}
                        </Link>

                        {sets.map((s, i) => {
                          const tbShown = s.tbLoser === "p1" ? s.tb : undefined;
                          return (
                            <div key={i} className="flex items-center justify-center">
                              <ScorePill games={s.p1} tbShown={tbShown} isHigher={s.p1 > s.p2} />
                            </div>
                          );
                        })}

                        <ResultSlot isWinner={p1Winner} />
                      </div>
                    </div>

                    {/* P2 */}
                    <div className={rowClass(p2Winner)}>
                      <div className="grid items-center gap-3" style={{ gridTemplateColumns }}>
                        <Link href={`/player/${m.p2.id}`} className={playerLinkClass()} title={m.p2.name}>
                          {m.p2.name}
                        </Link>

                        {sets.map((s, i) => {
                          const tbShown = s.tbLoser === "p2" ? s.tb : undefined;
                          return (
                            <div key={i} className="flex items-center justify-center">
                              <ScorePill games={s.p2} tbShown={tbShown} isHigher={s.p2 > s.p1} />
                            </div>
                          );
                        })}

                        <ResultSlot isWinner={p2Winner} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 text-xs text-gray-500 px-1">
                    Higher games in a set are subtly highlighted.
                    {sets.some((s) => typeof s.tb === "number") ? " Tie-break points are shown for the set loser." : null}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-900/40 border border-gray-700 p-5 text-gray-400">
              {m.score ? (
                <>
                  We have a score string, but it isn’t in a parseable format yet:
                  <span className="ml-2 font-mono text-gray-200">{m.score}</span>
                </>
              ) : (
                "No score available yet."
              )}
            </div>
          )}
        </section>

        {showLivePoints ? (
  <LivePointsSim
    initialPoints={m.livePoints!}
    p1Name={m.p1.name}
    p2Name={m.p2.name}
    enabled
    intervalMs={2000}
  />
) : null}
      </div>
    </main>
  );
}
