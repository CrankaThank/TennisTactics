import Link from "next/link";
import type { Match } from "../lib/matches";

type Variant = "matches" | "tournament" | "player";

type Props = {
  match: Match;
  variant?: Variant;
  highlightPlayerId?: string;
};

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

function statusPill(status: "upcoming" | "live" | "finished") {
  const base = "text-xs px-2 py-1 rounded-full border leading-none font-semibold tracking-wide";
  if (status === "live") return `${base} border-rose-500/35 text-rose-100 bg-rose-500/15`;
  if (status === "finished") return `${base} border-emerald-500/35 text-emerald-100 bg-emerald-500/15`;
  return `${base} border-sky-500/30 text-sky-100 bg-sky-500/12`;
}

function scoreSplit(score?: string) {
  if (!score) return { s1: "", s2: "" };
  const parts = score.split(/\s+/);
  return { s1: parts[0] ?? "", s2: parts[1] ?? "" };
}

function rowClass(isWinner: boolean, isHighlighted: boolean) {
  return [
    "flex items-center justify-between gap-3",
    "rounded-xl border px-4 py-3",
    "min-h-[52px]",
    isWinner
      ? "border-emerald-400/35 bg-emerald-500/12 shadow-[inset_4px_0_0_0_rgba(16,185,129,0.45)]"
      : "border-white/10 bg-white/[0.02]",
    isHighlighted ? "ring-1 ring-white/10" : "",
  ].join(" ");
}

function linkBase() {
  return [
    "cursor-pointer select-none",
    "text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
  ].join(" ");
}

function miniChip() {
  return [
    "cursor-pointer select-none",
    "inline-flex items-center justify-center h-7 px-3 rounded-full border text-[11px] font-semibold tracking-wide leading-none",
    "border-white/10 bg-white/[0.03] text-gray-200 hover:text-white hover:border-white/20 transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
  ].join(" ");
}

function h2hHref(tour: string, p1: string, p2: string) {
  // stable ordering so the same pair always yields the same URL
  const a = p1 < p2 ? p1 : p2;
  const b = p1 < p2 ? p2 : p1;
  return `/h2h?tour=${encodeURIComponent(tour)}&p1=${encodeURIComponent(a)}&p2=${encodeURIComponent(b)}`;
}

export function MatchCard({ match: m, variant = "matches", highlightPlayerId }: Props) {
  const { s1, s2 } = scoreSplit(m.score);

  const isFinished = m.status === "finished" && !!m.winnerId;
  const p1Winner = isFinished && m.winnerId === m.p1.id;
  const p2Winner = isFinished && m.winnerId === m.p2.id;

  const p1Highlighted = !!highlightPlayerId && m.p1.id === highlightPlayerId;
  const p2Highlighted = !!highlightPlayerId && m.p2.id === highlightPlayerId;

  return (
    <div className="rounded-2xl bg-gray-800 p-5 shadow border border-transparent hover:border-white/10 transition">
      {/* Meta row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-400">
          {m.tour} •{" "}
          <Link href={`/tournament/${m.tournamentId}`} className={linkBase()}>
            {m.tournamentName}
          </Link>{" "}
          • {m.round} • {formatTime(m.startTime)} (UTC)
        </div>

        <div className="flex items-center gap-2">
          <span className={statusPill(m.status)}>{m.status.toUpperCase()}</span>

          {/* ✅ H2H now includes tour so WTA matches lock to WTA */}
          <Link href={h2hHref(m.tour, m.p1.id, m.p2.id)} className={miniChip()}>
            H2H
          </Link>

          {/* ✅ renamed and positioned after H2H */}
          <Link href={`/match/${m.id}`} className={miniChip()}>
            View Match
          </Link>
        </div>
      </div>

      {/* Players */}
      <div className="mt-4 grid gap-3">
        <div className={rowClass(p1Winner, p1Highlighted)}>
          <Link
            href={`/player/${m.p1.id}`}
            className="min-w-0 truncate text-white font-semibold hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
          >
            {m.p1.name}
          </Link>
          <div className="flex items-center gap-3">
            <span className="tabular-nums text-gray-300">{s1}</span>
            {p1Winner ? (
              <span className="inline-flex items-center justify-center h-7 px-3 rounded-full border border-emerald-300/50 bg-emerald-500/30 text-emerald-50 text-[11px] font-semibold leading-none">
                WINNER
              </span>
            ) : (
              <span className="text-xs text-gray-600"> </span>
            )}
          </div>
        </div>

        <div className={rowClass(p2Winner, p2Highlighted)}>
          <Link
            href={`/player/${m.p2.id}`}
            className="min-w-0 truncate text-gray-200 font-semibold hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
          >
            {m.p2.name}
          </Link>
          <div className="flex items-center gap-3">
            <span className="tabular-nums text-gray-300">{s2}</span>
            {p2Winner ? (
              <span className="inline-flex items-center justify-center h-7 px-3 rounded-full border border-emerald-300/50 bg-emerald-500/30 text-emerald-50 text-[11px] font-semibold leading-none">
                WINNER
              </span>
            ) : (
              <span className="text-xs text-gray-600"> </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
