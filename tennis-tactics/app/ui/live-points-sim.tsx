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
  completedSets: CompletedSet[]; // in order
  lastTb?: { loser: PlayerKey; points: number };

  server: PlayerKey; // current server
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

  // update server in TB at point-level (accurate enough)
  if (next.inTiebreak) {
    const played = next.tbPoints.p1 + next.tbPoints.p2;
    next.server = tiebreakServerAtPoint(next.tbStartServer, played);
  }

  let setWon = false;

  if (next.inTiebreak) {
    next.tbPoints[winner] += 1;

    const tbDone = isTiebreakWon(next.tbPoints.p1, next.tbPoints.p2);
    if (tbDone) {
      const setScore: CompletedSet = { p1: 0, p2: 0 };

      setScore[winner] = 7 as any;
      setScore[loser] = 6 as any;

      const loserTbPoints = next.tbPoints[loser];
      setScore.tbLoser = loser;
      setScore.tb = loserTbPoints;

      next.completedSets.push(setScore);

      next.setsWon[winner] += 1;
      setWon = true;

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
  } else {
    next.gamePoints[winner] += 1;

    const gameDone = isNormalGameWon(next.gamePoints.p1, next.gamePoints.p2);
    if (gameDone) {
      next.gamesInSet[winner] += 1;

      next.gamePoints = { p1: 0, p2: 0 };
      next.server = other(next.server);

      if (next.gamesInSet.p1 === 6 && next.gamesInSet.p2 === 6) {
        next.inTiebreak = true;
        next.tbPoints = { p1: 0, p2: 0 };
        next.tbStartServer = next.server;
      }

      const g1 = next.gamesInSet.p1;
      const g2 = next.gamesInSet.p2;

      const maybeSetWin =
        !next.inTiebreak && ((g1 >= 6 || g2 >= 6) && Math.abs(g1 - g2) >= 2);

      if (maybeSetWin) {
        const setScore: CompletedSet = { p1: g1, p2: g2 };
        next.completedSets.push(setScore);

        next.setsWon[winner] += 1;
        setWon = true;

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
function replayStateFromPoints(points: MatchPoint[], serverSeed: PlayerKey, bestOf: 3 | 5): EngineState {
  let st = initialEngine(serverSeed);
  const setsNeeded = requiredSets(bestOf);

  for (const pt of points) {
    if (st.setsWon.p1 >= setsNeeded || st.setsWon.p2 >= setsNeeded) break;
    const winner = pt.winner as PlayerKey;
    st = applyWinner(st, winner, bestOf).nextState;
  }

  return st;
}

// --- UI helpers (consistent with your premium UI) ---

function scorePillClass(isHigher: boolean) {
  return [
    "h-9 w-[72px] rounded-full border tabular-nums text-sm font-semibold",
    "flex items-center justify-center leading-none select-none",
    isHigher ? "bg-white/10 text-white border-white/20" : "bg-white/[0.04] text-gray-200 border-white/12",
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

/** Small stat card component to keep markup clean + consistent */
function StatCard({
  title,
  p1Name,
  p2Name,
  p1Value,
  p2Value,
}: {
  title: string;
  p1Name: string;
  p2Name: string;
  p1Value: string | number;
  p2Value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{title}</div>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="text-gray-200 truncate">{p1Name}</span>
        <span className="text-white font-semibold tabular-nums">{p1Value}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="text-gray-200 truncate">{p2Name}</span>
        <span className="text-white font-semibold tabular-nums">{p2Value}</span>
      </div>
    </div>
  );
}

export function LivePointsSim({
  initialPoints,
  p1Name,
  p2Name,
  enabled = true,
  intervalMs = 2000,
  bestOf = 3,
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
  }, [initialPoints, serverSeed, bestOf]);

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
    ? { p1: String(engine.tbPoints.p1), p2: String(engine.tbPoints.p2), label: "Tiebreak" }
    : (() => {
        const d = normalGameDisplay(engine.gamePoints.p1, engine.gamePoints.p2);
        return { p1: d.a, p2: d.b, label: "Game" };
      })();

  const matchWinner: PlayerKey | null =
    matchDone ? (engine.setsWon.p1 > engine.setsWon.p2 ? "p1" : "p2") : null;

  const displaySetCount = 3;
  const filled: Array<{ p1: number | "—"; p2: number | "—"; tbLoser?: PlayerKey; tb?: number }> = [];

  for (let i = 0; i < displaySetCount; i++) {
    const completed = engine.completedSets[i];
    if (completed) {
      filled.push({ p1: completed.p1, p2: completed.p2, tbLoser: completed.tbLoser, tb: completed.tb });
      continue;
    }
    if (i === engine.completedSets.length) {
      filled.push({ p1: engine.gamesInSet.p1, p2: engine.gamesInSet.p2 });
      continue;
    }
    filled.push({ p1: "—", p2: "—" });
  }

  const gridTemplateColumns = buildGridTemplate(displaySetCount, true);

  return (
    <section className="space-y-4">
      {/* Controls + live scoreboard */}
      <div className="rounded-2xl border border-gray-700 bg-gray-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-400">
            Simulation:{" "}
            <span className={simOn ? "text-emerald-200" : "text-gray-300"}>
              {simOn ? "ON" : "OFF"}
            </span>
            <span className="text-gray-600"> • </span>
            <span className="text-gray-500">
              {matchDone ? "Match complete" : `New point every ${Math.round(intervalMs / 100) / 10}s`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSimOn((v) => !v)}
              className={`px-3 py-2 text-xs rounded-xl border transition ${
                simOn
                  ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-100"
                  : "border-gray-700 bg-gray-900/40 text-gray-300 hover:text-white"
              }`}
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
              className="px-3 py-2 text-xs rounded-xl border border-gray-700 bg-gray-900/40 text-gray-300 hover:text-white transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* ✅ REORDERED + LOCKED SINGLE ROW (mobile scroll, desktop fits) */}
        <div className="mt-4">
          <div className="-mx-4 px-4 overflow-x-auto">
            <div className="grid grid-cols-3 gap-3 min-w-[720px]">
              {/* 1) Game score */}
              <StatCard
                title={engine.inTiebreak ? "Tiebreak" : "Game score"}
                p1Name={p1Name}
                p2Name={p2Name}
                p1Value={gameDisp.p1}
                p2Value={gameDisp.p2}
              />

              {/* 2) Games (current set) */}
              <StatCard
                title="Games (current set)"
                p1Name={p1Name}
                p2Name={p2Name}
                p1Value={engine.gamesInSet.p1}
                p2Value={engine.gamesInSet.p2}
              />

              {/* 3) Sets */}
              <StatCard
                title="Sets"
                p1Name={p1Name}
                p2Name={p2Name}
                p1Value={engine.setsWon.p1}
                p2Value={engine.setsWon.p2}
              />
            </div>
          </div>
        </div>
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
            Tie-break notation appears as <span className="text-gray-300 font-semibold">7(5)-6</span> (loser TB points).
          </div>
        </div>
      </section>

      {/* Point feed */}
      <LivePoints points={points} p1Name={p1Name} p2Name={p2Name} />
    </section>
  );
}
