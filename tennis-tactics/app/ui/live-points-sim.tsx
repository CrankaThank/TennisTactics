"use client";

import { useEffect, useMemo, useState } from "react";
import type { MatchPoint } from "../lib/matches";
import { LivePoints } from "./live-points";

type PlayerKey = "p1" | "p2";

type Props = {
  initialPoints: MatchPoint[];
  p1Name: string;
  p2Name: string;

  enabled?: boolean;
  intervalMs?: number;
  bestOf?: 3 | 5;

  // Scoreboard FIRST, controls under it
  showControls?: boolean;

  // Momentum strip
  momentumCount?: number; // default 12
};

type CompletedSet = { p1: number; p2: number; tbLoser?: PlayerKey; tb?: number };

type EngineState = {
  setNumber: number; // 1-based (current set)
  gamesInSet: Record<PlayerKey, number>;
  setsWon: Record<PlayerKey, number>;

  // Normal game points (raw counters)
  gamePoints: Record<PlayerKey, number>;

  // Tiebreak state
  inTiebreak: boolean;
  tbPoints: Record<PlayerKey, number>;
  tbStartServer: PlayerKey;

  // For the Score By Set panel
  completedSets: CompletedSet[];

  server: PlayerKey; // current server (for next point)
};

function other(p: PlayerKey): PlayerKey {
  return p === "p1" ? "p2" : "p1";
}

function requiredSets(bestOf: 3 | 5) {
  return bestOf === 5 ? 3 : 2;
}

function nowIso() {
  return new Date().toISOString();
}

function nextPointLabel() {
  const labels = [
    "Ace (T)",
    "Ace (wide)",
    "Double fault",
    "Forehand winner",
    "Backhand winner",
    "Unforced error",
    "Forced error",
    "Serve +1 winner",
    "Volley winner",
    "Return winner",
    "Long rally won",
  ];
  return labels[Math.floor(Math.random() * labels.length)];
}

function normalGameDisplay(a: number, b: number) {
  const map = ["0", "15", "30", "40"];

  if (a <= 2 && b <= 2) return { a: map[a], b: map[b] };

  if (a === b && a >= 3) return { a: "40", b: "40" }; // deuce
  if (a > b && a >= 4 && a === b + 1) return { a: "Ad", b: "40" };
  if (b > a && b >= 4 && b === a + 1) return { a: "40", b: "Ad" };

  if (a >= 3 && b < 3) return { a: "40", b: map[b] };
  if (b >= 3 && a < 3) return { a: map[a], b: "40" };

  return { a: "40", b: "40" };
}

function isNormalGameWon(p1Pts: number, p2Pts: number) {
  if (p1Pts >= 4 || p2Pts >= 4) {
    const diff = Math.abs(p1Pts - p2Pts);
    if (diff >= 2) return true;
  }
  return false;
}

function isTiebreakWon(p1: number, p2: number) {
  if (p1 >= 7 || p2 >= 7) {
    const diff = Math.abs(p1 - p2);
    if (diff >= 2) return true;
  }
  return false;
}

// TB serve rotation
function tiebreakServerAtPoint(startServer: PlayerKey, tbPointIndex: number): PlayerKey {
  if (tbPointIndex === 0) return startServer;
  const block = Math.floor((tbPointIndex - 1) / 2);
  return block % 2 === 0 ? other(startServer) : startServer;
}

function initialEngine(serverSeed: PlayerKey): EngineState {
  return {
    setNumber: 1,
    gamesInSet: { p1: 0, p2: 0 },
    setsWon: { p1: 0, p2: 0 },
    gamePoints: { p1: 0, p2: 0 },
    inTiebreak: false,
    tbPoints: { p1: 0, p2: 0 },
    tbStartServer: serverSeed,
    completedSets: [],
    server: serverSeed,
  };
}

/**
 * Applies a point winner and returns updated engine state.
 * Finalizes sets into completedSets (including TB loser points when relevant).
 */
function applyWinner(st: EngineState, winner: PlayerKey, bestOf: 3 | 5) {
  const loser = other(winner);
  const setsNeeded = requiredSets(bestOf);

  let next: EngineState = {
    ...st,
    gamesInSet: { ...st.gamesInSet },
    setsWon: { ...st.setsWon },
    gamePoints: { ...st.gamePoints },
    tbPoints: { ...st.tbPoints },
    completedSets: [...st.completedSets],
  };

  // stop if match already done
  if (next.setsWon.p1 >= setsNeeded || next.setsWon.p2 >= setsNeeded) {
    return { nextState: next, events: { matchDone: true, setWon: false } };
  }

  // update server in TB at point-level
  if (next.inTiebreak) {
    const played = next.tbPoints.p1 + next.tbPoints.p2;
    next.server = tiebreakServerAtPoint(next.tbStartServer, played);
  }

  let setWon = false;

  if (next.inTiebreak) {
    next.tbPoints[winner] += 1;

    const tbDone = isTiebreakWon(next.tbPoints.p1, next.tbPoints.p2);
    if (tbDone) {
      // TB ended: set becomes 7-6
      const setScore: CompletedSet = { p1: 0, p2: 0 };

      // Winner 7, loser 6
      (setScore as any)[winner] = 7;
      (setScore as any)[loser] = 6;

      // TB loser points shown in notation
      const loserTbPoints = next.tbPoints[loser];
      setScore.tbLoser = loser;
      setScore.tb = loserTbPoints;

      next.completedSets.push(setScore);

      next.setsWon[winner] += 1;
      setWon = true;

      // reset for next set if match continues
      if (next.setsWon[winner] < setsNeeded) {
        next.setNumber += 1;
        next.gamesInSet = { p1: 0, p2: 0 };
        next.gamePoints = { p1: 0, p2: 0 };
        next.inTiebreak = false;
        next.tbPoints = { p1: 0, p2: 0 };
        // next set server flip (simple + stable)
        next.server = other(next.server);
        next.tbStartServer = next.server;
      }
    }
  } else {
    next.gamePoints[winner] += 1;

    const gameDone = isNormalGameWon(next.gamePoints.p1, next.gamePoints.p2);
    if (gameDone) {
      // award game
      next.gamesInSet[winner] += 1;

      // reset game points
      next.gamePoints = { p1: 0, p2: 0 };

      // flip server each game
      next.server = other(next.server);

      // enter TB at 6-6
      if (next.gamesInSet.p1 === 6 && next.gamesInSet.p2 === 6) {
        next.inTiebreak = true;
        next.tbPoints = { p1: 0, p2: 0 };
        next.tbStartServer = next.server; // TB starts with whoever would serve next
      }

      // set win without TB: 6+ games with 2 lead
      const g1 = next.gamesInSet.p1;
      const g2 = next.gamesInSet.p2;

      const maybeSetWin =
        !next.inTiebreak && ((g1 >= 6 || g2 >= 6) && Math.abs(g1 - g2) >= 2);

      if (maybeSetWin) {
        const setScore: CompletedSet = { p1: g1, p2: g2 };
        next.completedSets.push(setScore);

        next.setsWon[winner] += 1;
        setWon = true;

        // reset for next set if match continues
        if (next.setsWon[winner] < setsNeeded) {
          next.setNumber += 1;
          next.gamesInSet = { p1: 0, p2: 0 };
          next.gamePoints = { p1: 0, p2: 0 };
          next.inTiebreak = false;
          next.tbPoints = { p1: 0, p2: 0 };
          next.server = other(next.server);
          next.tbStartServer = next.server;
        }
      }
    }
  }

  const matchDone = next.setsWon.p1 >= setsNeeded || next.setsWon.p2 >= setsNeeded;
  return { nextState: next, events: { matchDone, setWon } };
}

/**
 * Replay state from a point list to prevent drift on hot reload.
 */
function replayStateFromPoints(
  points: MatchPoint[],
  serverSeed: PlayerKey,
  bestOf: 3 | 5
): EngineState {
  let st = initialEngine(serverSeed);
  const setsNeeded = requiredSets(bestOf);

  for (const pt of points) {
    if (st.setsWon.p1 >= setsNeeded || st.setsWon.p2 >= setsNeeded) break;
    const winner = pt.winner as PlayerKey;
    st = applyWinner(st, winner, bestOf).nextState;
  }

  return st;
}

// ---------- UI helpers ----------

function statCard() {
  return "rounded-xl border border-white/10 bg-white/[0.02] p-3";
}
function statLabel() {
  return "text-[11px] uppercase tracking-wide text-gray-500";
}
function rowKV() {
  return "mt-1 flex items-center justify-between text-sm";
}
function tabularVal() {
  return "text-white font-semibold tabular-nums";
}

function serverPill() {
  return [
    "inline-flex items-center gap-2",
    "h-7 px-3 rounded-full border",
    "border-white/10 bg-white/[0.03]",
    "text-[11px] font-semibold tracking-wide text-gray-200",
    "select-none",
  ].join(" ");
}

function serverDot(active: boolean) {
  return [
    "h-2.5 w-2.5 rounded-full",
    active ? "bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" : "bg-white/15",
  ].join(" ");
}

// Momentum dots
function momentumDotClass(winner: PlayerKey, isServer: boolean) {
  // winner color (p1 = emerald, p2 = sky) + server ring
  const base = "h-2.5 w-2.5 rounded-full";
  const fill = winner === "p1" ? "bg-emerald-400" : "bg-sky-400";
  const ring = isServer ? "ring-2 ring-white/25" : "ring-0";
  const glow = isServer ? "shadow-[0_0_0_3px_rgba(255,255,255,0.06)]" : "";
  return [base, fill, ring, glow].join(" ");
}

function momentumLegendDotClass(winner: PlayerKey) {
  const base = "h-2.5 w-2.5 rounded-full";
  const fill = winner === "p1" ? "bg-emerald-400" : "bg-sky-400";
  return [base, fill].join(" ");
}

function scorePillClass(isHigher: boolean) {
  return [
    "h-9 w-[72px] rounded-full border tabular-nums text-sm font-semibold",
    "flex items-center justify-center leading-none select-none",
    isHigher
      ? "bg-white/10 text-white border-white/20"
      : "bg-white/[0.04] text-gray-200 border-white/12",
  ].join(" ");
}

function headerPillClass() {
  return [
    "h-7 w-[72px] rounded-full border text-[11px] uppercase tracking-wide",
    "flex items-center justify-center leading-none select-none",
    "bg-white/[0.03] text-gray-300 border-white/10",
  ].join(" ");
}

function rowClass(isWinnerRow: boolean) {
  return [
    "rounded-xl border px-4 py-3",
    "min-h-[64px]",
    "flex items-center",
    isWinnerRow
      ? "border-emerald-400/40 bg-emerald-500/18 shadow-[inset_4px_0_0_0_rgba(16,185,129,0.55)]"
      : "border-white/10 bg-white/[0.02]",
  ].join(" ");
}

function winnerBadge() {
  return (
    <span className="inline-flex items-center justify-center h-7 px-3 rounded-full border border-emerald-300/50 bg-emerald-500/30 text-emerald-50 text-[11px] font-semibold tracking-wide leading-none">
      WINNER
    </span>
  );
}

function buildGridTemplate(setCount: number, showResult: boolean) {
  const setCols = Array.from({ length: setCount }, () => "72px").join(" ");
  const resultCol = showResult ? "140px" : "0px";
  return `minmax(260px, 1fr) ${setCols} ${resultCol}`.trim();
}

function formatSetCell(val: number | "—", tbShown?: number) {
  if (val === "—") return "—";
  if (tbShown === undefined) return String(val);
  return `${val}(${tbShown})`;
}

function controlButtonClass(active: boolean) {
  return [
    "cursor-pointer select-none",
    "px-3 py-2 text-xs rounded-xl border transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
    active
      ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-100 hover:border-emerald-300/50"
      : "border-gray-700 bg-gray-900/40 text-gray-300 hover:text-white hover:border-gray-500/60",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" ");
}

// ---------- Component ----------

export function LivePointsSim({
  initialPoints,
  p1Name,
  p2Name,
  enabled = true,
  intervalMs = 2000,
  bestOf = 3,
  showControls = true,
  momentumCount = 12,
}: Props) {
  const serverSeed: PlayerKey = useMemo(() => {
    const last = initialPoints[initialPoints.length - 1];
    return (last?.server as PlayerKey) || "p1";
  }, [initialPoints]);

  const [points, setPoints] = useState<MatchPoint[]>(initialPoints);
  const [simOn, setSimOn] = useState(enabled);

  const [engine, setEngine] = useState<EngineState>(() =>
    replayStateFromPoints(initialPoints, serverSeed, bestOf)
  );

  useEffect(() => {
    setPoints(initialPoints);
    setEngine(replayStateFromPoints(initialPoints, serverSeed, bestOf));
    setSimOn(enabled);
  }, [initialPoints, serverSeed, bestOf, enabled]);

  useEffect(() => {
    if (!simOn) return;

    const t = setInterval(() => {
      setPoints((prev) => {
        const st = replayStateFromPoints(prev, serverSeed, bestOf);

        const setsNeeded = requiredSets(bestOf);
        const matchDone = st.setsWon.p1 >= setsNeeded || st.setsWon.p2 >= setsNeeded;
        if (matchDone) return prev;

        const server = st.inTiebreak
          ? tiebreakServerAtPoint(st.tbStartServer, st.tbPoints.p1 + st.tbPoints.p2)
          : st.server;

        // winner bias: server advantage
        const r = Math.random();
        const winner: PlayerKey = r < 0.58 ? server : other(server);

        const nextId = `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const gamesPlayed = st.gamesInSet.p1 + st.gamesInSet.p2;
        const gameNumber = Math.max(1, gamesPlayed + 1);
        const pointNumber = st.inTiebreak
          ? st.tbPoints.p1 + st.tbPoints.p2 + 1
          : st.gamePoints.p1 + st.gamePoints.p2 + 1;

        const nextPoint: MatchPoint = {
          id: nextId,
          set: st.setNumber,
          game: gameNumber,
          point: pointNumber,
          server,
          winner,
          label: nextPointLabel(),
          atISO: nowIso(),
        };

        const applied = applyWinner(st, winner, bestOf);
        setEngine(applied.nextState);

        return [...prev, nextPoint].slice(-500);
      });
    }, intervalMs);

    return () => clearInterval(t);
  }, [simOn, intervalMs, serverSeed, bestOf]);

  const setsNeeded = requiredSets(bestOf);
  const matchDone = engine.setsWon.p1 >= setsNeeded || engine.setsWon.p2 >= setsNeeded;

  const gameDisp = engine.inTiebreak
    ? { p1: String(engine.tbPoints.p1), p2: String(engine.tbPoints.p2) }
    : (() => {
        const d = normalGameDisplay(engine.gamePoints.p1, engine.gamePoints.p2);
        return { p1: d.a, p2: d.b };
      })();

  const matchWinner: PlayerKey | null =
    matchDone ? (engine.setsWon.p1 > engine.setsWon.p2 ? "p1" : "p2") : null;

  // Score By Set (S1/S2/S3):
  const displaySetCount = 3;
  const filled: Array<{ p1: number | "—"; p2: number | "—"; tbLoser?: PlayerKey; tb?: number }> = [];

  for (let i = 0; i < displaySetCount; i++) {
    const completed = engine.completedSets[i];
    if (completed) {
      filled.push({
        p1: completed.p1,
        p2: completed.p2,
        tbLoser: completed.tbLoser,
        tb: completed.tb,
      });
      continue;
    }

    if (i === engine.completedSets.length) {
      filled.push({ p1: engine.gamesInSet.p1, p2: engine.gamesInSet.p2 });
      continue;
    }

    filled.push({ p1: "—", p2: "—" });
  }

  const gridTemplateColumns = buildGridTemplate(displaySetCount, true);
  const serverName = engine.server === "p1" ? p1Name : p2Name;

  // Momentum points: last N points (oldest -> newest)
  const momentum = useMemo(() => {
    const slice = points.slice(Math.max(0, points.length - momentumCount));
    return slice;
  }, [points, momentumCount]);

  const p1Momentum = useMemo(() => {
    let n = 0;
    for (const pt of momentum) if ((pt.winner as PlayerKey) === "p1") n += 1;
    return n;
  }, [momentum]);

  const p2Momentum = useMemo(() => momentum.length - p1Momentum, [momentum, p1Momentum]);

  return (
    <section className="space-y-4">
      {/* Scoreboard FIRST */}
      <div className="rounded-2xl border border-gray-700 bg-gray-900/40 p-4">
        {/* Current set mini-line */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-400">
              Set <span className="text-white font-semibold tabular-nums">{engine.setNumber}</span>
            </span>

            <span className="text-gray-600">•</span>

            <span className="text-gray-400">
              Games{" "}
              <span className="text-white font-semibold tabular-nums">
                {engine.gamesInSet.p1}-{engine.gamesInSet.p2}
              </span>
            </span>

            {engine.inTiebreak ? (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">
                  TB{" "}
                  <span className="text-white font-semibold tabular-nums">
                    {engine.tbPoints.p1}-{engine.tbPoints.p2}
                  </span>
                </span>
              </>
            ) : null}
          </div>

          <div className={serverPill()}>
            <span className={serverDot(true)} />
            <span className="text-gray-400">Server:</span>
            <span className="text-white">{serverName}</span>
          </div>
        </div>

        {/* ✅ Momentum strip */}
        <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="text-[11px] uppercase tracking-wide text-gray-500">Momentum</div>
              <div className="text-[11px] text-gray-500">
                last <span className="text-gray-300 font-semibold tabular-nums">{momentumCount}</span> points
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <span className={momentumLegendDotClass("p1")} />
                <span className="text-gray-400">{p1Name}</span>
                <span className="text-gray-300 font-semibold tabular-nums">{p1Momentum}</span>
              </span>

              <span className="inline-flex items-center gap-1.5">
                <span className={momentumLegendDotClass("p2")} />
                <span className="text-gray-400">{p2Name}</span>
                <span className="text-gray-300 font-semibold tabular-nums">{p2Momentum}</span>
              </span>

              <span className="hidden sm:inline text-gray-600">•</span>

              <span className="hidden sm:inline text-gray-500">
                ring = <span className="text-gray-300 font-semibold">server</span>
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {momentum.length === 0 ? (
              <div className="text-sm text-gray-500 py-1">No points yet.</div>
            ) : (
              momentum.map((pt) => {
                const w = pt.winner as PlayerKey;
                const s = pt.server as PlayerKey;
                const title = `${w === "p1" ? p1Name : p2Name} won • ${pt.label ?? "Point"} • ${
                  s === "p1" ? p1Name : p2Name
                } served`;
                return (
                  <span
                    key={pt.id}
                    title={title}
                    className={momentumDotClass(w, s === w ? true : s === "p1" ? s === "p1" : s === "p2")}
                    aria-label={title}
                  />
                );
              })
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* 1) Game score (ONLY place with server dots) */}
          <div className={statCard()}>
            <div className={statLabel()}>{engine.inTiebreak ? "Tiebreak" : "Game score"}</div>

            <div className={rowKV()}>
              <span className="text-gray-200 inline-flex items-center gap-2 min-w-0 truncate">
                <span className={serverDot(engine.server === "p1")} />
                <span className="truncate">{p1Name}</span>
              </span>
              <span className={tabularVal()}>{gameDisp.p1}</span>
            </div>

            <div className={rowKV()}>
              <span className="text-gray-200 inline-flex items-center gap-2 min-w-0 truncate">
                <span className={serverDot(engine.server === "p2")} />
                <span className="truncate">{p2Name}</span>
              </span>
              <span className={tabularVal()}>{gameDisp.p2}</span>
            </div>
          </div>

          {/* 2) Games (no server dots) */}
          <div className={statCard()}>
            <div className={statLabel()}>Games (current set)</div>

            <div className={rowKV()}>
              <span className="text-gray-200 min-w-0 truncate">{p1Name}</span>
              <span className={tabularVal()}>{engine.gamesInSet.p1}</span>
            </div>

            <div className={rowKV()}>
              <span className="text-gray-200 min-w-0 truncate">{p2Name}</span>
              <span className={tabularVal()}>{engine.gamesInSet.p2}</span>
            </div>
          </div>

          {/* 3) Sets (no server dots) */}
          <div className={statCard()}>
            <div className={statLabel()}>Sets</div>

            <div className={rowKV()}>
              <span className="text-gray-200 min-w-0 truncate">{p1Name}</span>
              <span className={tabularVal()}>{engine.setsWon.p1}</span>
            </div>

            <div className={rowKV()}>
              <span className="text-gray-200 min-w-0 truncate">{p2Name}</span>
              <span className={tabularVal()}>{engine.setsWon.p2}</span>
            </div>
          </div>
        </div>

        {/* Controls BELOW scoreboard */}
        {showControls ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-400">
              Simulation:{" "}
              <span className={simOn ? "text-emerald-200" : "text-gray-300"}>{simOn ? "ON" : "OFF"}</span>
              <span className="text-gray-600"> • </span>
              <span className="text-gray-500">
                {matchDone ? "Match complete" : `New point every ${Math.round(intervalMs / 100) / 10}s`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSimOn((v) => !v)}
                className={controlButtonClass(simOn)}
                disabled={matchDone}
              >
                {simOn ? "Stop simulation" : "Start simulation"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSimOn(false);
                  setPoints(initialPoints);
                  setEngine(replayStateFromPoints(initialPoints, serverSeed, bestOf));
                }}
                className={controlButtonClass(false)}
              >
                Reset
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Score By Set */}
      <section className="rounded-2xl bg-gray-800 p-6 shadow space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Score By Set</h2>
          <div className="text-sm text-gray-500">Live updating • completed sets fill in</div>
        </div>

        <div className="rounded-2xl border border-gray-700 bg-gray-900/40 p-4">
          <div
            className="grid items-center gap-3 px-1 pb-2 border-b border-white/6"
            style={{ gridTemplateColumns }}
          >
            <div className="text-[11px] uppercase tracking-wide text-gray-500">Player</div>

            <div className={`${headerPillClass()} justify-self-center`}>S1</div>
            <div className={`${headerPillClass()} justify-self-center`}>S2</div>
            <div className={`${headerPillClass()} justify-self-center`}>S3</div>

            <div className="text-[11px] uppercase tracking-wide text-gray-500 text-right pr-1">
              Result
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className={rowClass(matchWinner === "p1")}>
              <div className="grid items-center gap-3 w-full" style={{ gridTemplateColumns }}>
                <div className="min-w-0 truncate text-gray-100 font-semibold">{p1Name}</div>

                {filled.map((s, idx) => {
                  const isHigher =
                    typeof s.p1 === "number" && typeof s.p2 === "number" ? s.p1 > s.p2 : false;
                  const tbShown = s.tbLoser === "p1" ? s.tb : undefined;
                  return (
                    <div key={idx} className={`${scorePillClass(isHigher)} justify-self-center`}>
                      {formatSetCell(s.p1, tbShown)}
                    </div>
                  );
                })}

                <div className="flex justify-end items-center h-9">
                  {matchWinner === "p1" ? winnerBadge() : <span className="text-xs text-gray-600">—</span>}
                </div>
              </div>
            </div>

            <div className={rowClass(matchWinner === "p2")}>
              <div className="grid items-center gap-3 w-full" style={{ gridTemplateColumns }}>
                <div className="min-w-0 truncate text-gray-100 font-semibold">{p2Name}</div>

                {filled.map((s, idx) => {
                  const isHigher =
                    typeof s.p1 === "number" && typeof s.p2 === "number" ? s.p2 > s.p1 : false;
                  const tbShown = s.tbLoser === "p2" ? s.tb : undefined;
                  return (
                    <div key={idx} className={`${scorePillClass(isHigher)} justify-self-center`}>
                      {formatSetCell(s.p2, tbShown)}
                    </div>
                  );
                })}

                <div className="flex justify-end items-center h-9">
                  {matchWinner === "p2" ? winnerBadge() : <span className="text-xs text-gray-600">—</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 text-xs text-gray-500 px-1">
            Tie-break notation appears as{" "}
            <span className="text-gray-300 font-semibold">7(5)-6</span> (loser TB points).
          </div>
        </div>
      </section>

      {/* Point feed */}
      <LivePoints points={points} p1Name={p1Name} p2Name={p2Name} />
    </section>
  );
}
