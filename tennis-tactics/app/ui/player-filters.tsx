"use client";

import { useRouter, useSearchParams } from "next/navigation";

type StatusFilter = "all" | "live" | "upcoming" | "finished";

export function PlayerFilters({
  initialStatus,
  initialQuery,
}: {
  initialStatus: StatusFilter;
  initialQuery: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(status: StatusFilter, q: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    if (q) params.set("q", q);
    else params.delete("q");

    router.push(`?${params.toString()}`);
  }

  const tabBase = [
    "cursor-pointer select-none", // ✅ hand cursor
    "px-3 py-1 rounded-full text-sm transition border",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" ");

  function tab(active: boolean) {
    return [
      tabBase,
      active
        ? "bg-white/10 text-white border-white/20"
        : "bg-gray-900/40 text-gray-300 border-gray-700 hover:text-white hover:border-gray-500/60",
    ].join(" ");
  }

  return (
    <div className="rounded-2xl bg-gray-800 p-4 shadow space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "live", "upcoming", "finished"] as StatusFilter[]).map(
          (s) => (
            <button
              key={s}
              type="button"
              onClick={() => update(s, initialQuery)}
              className={tab(initialStatus === s)}
            >
              {s === "all"
                ? "All"
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          )
        )}

        <div className="flex-1" />

        <input
          defaultValue={initialQuery}
          onChange={(e) => update(initialStatus, e.target.value)}
          placeholder="Search opponent, tournament..."
          className="w-full sm:w-72 rounded-xl bg-gray-900 px-4 py-2 text-gray-100 placeholder:text-gray-500 outline-none border border-gray-700 focus:border-gray-500"
        />
      </div>
    </div>
  );
}
