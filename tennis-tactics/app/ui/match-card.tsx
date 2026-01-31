"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Match } from "../lib/matches";

type Variant = "tournament" | "player" | "matches";

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

function resultBadgeClass(result: "W" | "L") {
  const base = "text-xs px-2 py-1 rounded-full border";
  if (result === "W") return `${base} border-emerald-500/30 text-emerald-200 bg-emerald-500/10`;
  return `${base} border-rose-500/30 text-rose-200 bg-rose-500/10`;
}

function stop(e: React.SyntheticEvent) {
  e.stopPropagation();
}

export function MatchCard({
  match,
  variant,
  highlightPlayerId,
}: {
  match: Match;
  variant: Variant;
  highlightPlayerId?: string;
}) {
  const router = useRouter();

  const onCardClick = () => router.push(`/match/${match.id}`);

  const onCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(`/match/${match.id}`);
    }
  };

  // Player page variant: show W/L for the highlighted player (when finished)
  const result =
    variant === "player" &&
    highlightPlayerId &&
    match.status === "finished" &&
    match.winnerId
      ? match.winnerId === highlightPlayerId
        ? ("W" as const)
        : ("L" as const)
      : null;

  const isHighlightedP1 =
    variant === "player" && highlightPlayerId ? match.p1.id === highlightPlayerId : false;

  const opponent =
    variant === "player" && highlightPlayerId
      ? isHighlightedP1
        ? match.p2
        : match.p1
      : null;

  const metaLine =
    variant === "tournament" ? (
      <>
        {match.round} • {formatTime(match.startTime)} (UTC)
      </>
    ) : variant === "player" ? (
      <>
        {match.tour} •{" "}
        <Link
          href={`/tournament/${match.tournamentId}`}
          onClick={stop}
          className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
        >
          {match.tournamentName}
        </Link>{" "}
        • {match.round} • {formatTime(match.startTime)} (UTC)
      </>
    ) : (
      <>
        {match.tour} •{" "}
        <Link
          href={`/tournament/${match.tournamentId}`}
          onClick={stop}
          className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
        >
          {match.tournamentName}
        </Link>{" "}
        • {match.round} • {formatTime(match.startTime)} (UTC)
      </>
    );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onCardClick}
      onKeyDown={onCardKeyDown}
      className={[
        "group relative rounded-2xl bg-gray-800 p-5 shadow transition",
        "cursor-pointer select-none",
        "border border-transparent hover:border-gray-700/80",
        "hover:bg-white/5",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/60",
      ].join(" ")}
      aria-label={`Open match: ${match.p1.name} vs ${match.p2.name}`}
    >
      {/* Subtle chevron cue */}
      <div className="pointer-events-none absolute right-4 top-4 text-gray-500 transition group-hover:translate-x-0.5 group-hover:text-gray-300">
        →
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
        <div className="text-sm text-gray-400">{metaLine}</div>

        <div className="flex items-center gap-2">
          {result ? <span className={resultBadgeClass(result)}>{result}</span> : null}
          <span className={statusPillClass(match.status)}>{match.status.toUpperCase()}</span>

          {/* explicit link (also stops propagation) */}
          <Link
            href={`/match/${match.id}`}
            onClick={stop}
            className="text-xs px-2 py-1 rounded-full bg-gray-900 text-gray-200 hover:text-white border border-gray-700 hover:border-gray-500 transition whitespace-nowrap"
          >
            Open match
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {variant === "player" && highlightPlayerId && opponent ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">
                {isHighlightedP1 ? match.p1.name : match.p2.name}
              </span>
              <span className="text-gray-500 text-sm">{isHighlightedP1 ? "P1" : "P2"}</span>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href={`/player/${opponent.id}`}
                onClick={stop}
                className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                {opponent.name}
              </Link>
              <span className="text-gray-600 text-sm">{isHighlightedP1 ? "P2" : "P1"}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Link
                href={`/player/${match.p1.id}`}
                onClick={stop}
                className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                {match.p1.name}
              </Link>
              <span className="text-gray-500 text-sm">P1</span>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href={`/player/${match.p2.id}`}
                onClick={stop}
                className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                {match.p2.name}
              </Link>
              <span className="text-gray-600 text-sm">P2</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-400">
        {match.score
          ? `Score: ${match.score}`
          : match.status === "upcoming"
          ? "Scheduled"
          : match.status === "live"
          ? "Live score will appear here."
          : "Final score unavailable."}
      </div>
    </div>
  );
}
