import Link from "next/link";
import { matches } from "./lib/matches";
import { tournaments } from "./lib/tournaments";
import { rankings } from "./lib/rankings";
import { MatchCard } from "./ui/match-card";

function chipLink() {
  return [
    "cursor-pointer select-none",
    "inline-flex items-center justify-center h-9 px-4 rounded-full",
    "border border-white/10 bg-white/[0.03]",
    "text-sm text-gray-200 hover:text-white",
    "hover:border-white/20 transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
  ].join(" ");
}

function softCard() {
  return "rounded-2xl bg-gray-800/70 border border-white/10 shadow p-5";
}

function title() {
  return "text-lg font-semibold text-white";
}

function sub() {
  return "text-sm text-gray-400";
}

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

function formatRange(start: string, end: string) {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
  return `${fmt.format(s)} – ${fmt.format(e)}`;
}

export default function HomePage() {
  // ---- Matches ----
  const liveMatches = matches.filter((m) => m.status === "live");
  const upcomingMatches = matches
    .filter((m) => m.status === "upcoming")
    .slice()
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const finishedMatches = matches.filter((m) => m.status === "finished");

  const nextUp = upcomingMatches.slice(0, 3);
  const liveTop = liveMatches.slice(0, 2);

  // ---- Tournaments ----
  const nowMs = Date.now();
  const startMs = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00Z`).getTime();
  const endMs = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T23:59:59Z`).getTime();

  const upcomingTournaments = tournaments
    .slice()
    .filter((t) => startMs(t.startDate) > nowMs)
    .sort((a, b) => startMs(a.startDate) - startMs(b.startDate))
    .slice(0, 3);

  const liveTournaments = tournaments
    .slice()
    .filter((t) => startMs(t.startDate) <= nowMs && endMs(t.endDate) >= nowMs)
    .sort((a, b) => endMs(a.endDate) - endMs(b.endDate))
    .slice(0, 2);

  // ---- Rankings ----
  const topATP = rankings
    .filter((r) => r.tour === "ATP")
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);

  const topWTA = rankings
    .filter((r) => r.tour === "WTA")
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* HERO */}
        <header className="rounded-3xl bg-gradient-to-b from-gray-800/70 to-gray-800/30 border border-white/10 shadow p-6 md:p-8">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">TennisTactics</h1>
            <p className="text-gray-300">
              Modern tennis stats and insights — live scores, draws, rankings, and head-to-head.
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              <Link href="/matches" className={chipLink()}>
                Browse matches
              </Link>
              <Link href="/tournaments" className={chipLink()}>
                Explore tournaments
              </Link>
              {/* ✅ Link rankings with a sensible default tour */}
              <Link href="/rankings?tour=ATP" className={chipLink()}>
                View rankings
              </Link>
              <Link href="/players" className={chipLink()}>
                Browse players
              </Link>
            </div>
          </div>
        </header>

        {/* LIVE + NEXT UP */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className={softCard()}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className={title()}>Live now</h2>
                <p className={sub()}>Matches currently in progress (sample data).</p>
              </div>
              <Link
                href="/matches"
                className="cursor-pointer text-sm text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                View all →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {liveTop.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-gray-400">
                  No live matches right now.
                </div>
              ) : (
                liveTop.map((m) => <MatchCard key={m.id} match={m} variant="matches" />)
              )}
            </div>
          </div>

          <div className={softCard()}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className={title()}>Next up</h2>
                <p className={sub()}>The next scheduled matches (UTC).</p>
              </div>
              <Link
                href="/matches"
                className="cursor-pointer text-sm text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                Full schedule →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {nextUp.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-gray-400">
                  No upcoming matches in sample data.
                </div>
              ) : (
                nextUp.map((m) => (
                  <Link
                    key={m.id}
                    href={`/match/${m.id}`}
                    className="cursor-pointer block rounded-2xl border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/15 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-gray-400">
                          {m.tour} • {m.tournamentName} • {m.round}
                        </div>
                        <div className="mt-2 text-white font-semibold truncate">
                          {m.p1.name} <span className="text-gray-500 font-medium">vs</span> {m.p2.name}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">{formatTime(m.startTime)} (UTC)</div>
                      </div>
                      <span className="inline-flex items-center justify-center h-7 px-3 rounded-full border border-sky-500/30 bg-sky-500/12 text-sky-100 text-[11px] font-semibold tracking-wide leading-none">
                        UPCOMING
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* ✅ removed the “Sample data only…” line entirely */}
          </div>
        </section>

        {/* TOURNAMENTS + RANKINGS */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className={softCard()}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className={title()}>Tournaments</h2>
                <p className={sub()}>Live and upcoming events.</p>
              </div>
              <Link
                href="/tournaments"
                className="cursor-pointer text-sm text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                Browse →
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              {liveTournaments.length ? (
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">Live</div>
                  <div className="space-y-2">
                    {liveTournaments.map((t) => (
                      <Link
                        key={t.id}
                        href={`/tournament/${t.id}`}
                        className="cursor-pointer block rounded-2xl border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/15 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-white font-semibold truncate">{t.name}</div>
                            <div className="mt-1 text-sm text-gray-400">
                              {t.tour} • {t.location} • {t.surface} • {t.level}
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              {formatRange(t.startDate, t.endDate)} (UTC)
                            </div>
                          </div>
                          <span className="inline-flex items-center justify-center h-7 px-3 rounded-full border border-rose-500/35 bg-rose-500/15 text-rose-100 text-[11px] font-semibold tracking-wide leading-none">
                            LIVE
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Upcoming</div>
                {upcomingTournaments.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-gray-400">
                    No upcoming tournaments in sample data.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingTournaments.map((t) => (
                      <Link
                        key={t.id}
                        href={`/tournament/${t.id}`}
                        className="cursor-pointer block rounded-2xl border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/15 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-white font-semibold truncate">{t.name}</div>
                            <div className="mt-1 text-sm text-gray-400">
                              {t.tour} • {t.location} • {t.surface} • {t.level}
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              {formatRange(t.startDate, t.endDate)} (UTC)
                            </div>
                          </div>
                          <span className="inline-flex items-center justify-center h-7 px-3 rounded-full border border-sky-500/30 bg-sky-500/12 text-sky-100 text-[11px] font-semibold tracking-wide leading-none">
                            UPCOMING
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={softCard()}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className={title()}>Top rankings</h2>
                <p className={sub()}>Quick glance at the top 5.</p>
              </div>

              {/* ✅ If they click this, default to ATP (consistent with your ranking page default) */}
              <Link
                href="/rankings?tour=ATP"
                className="cursor-pointer text-sm text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                Open →
              </Link>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">ATP</div>
                  {/* ✅ Full list opens ATP */}
                  <Link
                    href="/rankings?tour=ATP"
                    className="cursor-pointer text-xs text-gray-300 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
                  >
                    Full list
                  </Link>
                </div>
                <div className="mt-3 space-y-2">
                  {topATP.map((r) => (
                    <Link
                      key={r.playerId}
                      href={`/player/${r.playerId}`}
                      className="cursor-pointer flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.04] hover:border-white/15 transition"
                    >
                      <div className="min-w-0">
                        <div className="text-white font-semibold truncate">
                          <span className="text-gray-400 tabular-nums mr-2">#{r.rank}</span>
                          {r.playerName}
                        </div>
                        <div className="text-xs text-gray-500">{r.country}</div>
                      </div>
                      <div className="text-sm text-gray-200 font-semibold tabular-nums">
                        {r.points.toLocaleString("en-GB")}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">WTA</div>
                  {/* ✅ Full list opens WTA */}
                  <Link
                    href="/rankings?tour=WTA"
                    className="cursor-pointer text-xs text-gray-300 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
                  >
                    Full list
                  </Link>
                </div>
                <div className="mt-3 space-y-2">
                  {topWTA.map((r) => (
                    <Link
                      key={r.playerId}
                      href={`/player/${r.playerId}`}
                      className="cursor-pointer flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.04] hover:border-white/15 transition"
                    >
                      <div className="min-w-0">
                        <div className="text-white font-semibold truncate">
                          <span className="text-gray-400 tabular-nums mr-2">#{r.rank}</span>
                          {r.playerName}
                        </div>
                        <div className="text-xs text-gray-500">{r.country}</div>
                      </div>
                      <div className="text-sm text-gray-200 font-semibold tabular-nums">
                        {r.points.toLocaleString("en-GB")}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
