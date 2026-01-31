"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type StatusFilter = "all" | "live" | "upcoming" | "finished";

export function PlayerFilters({
  initialStatus,
  initialQuery,
}: {
  initialStatus: StatusFilter;
  initialQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = useState(initialQuery);

  const status = useMemo(() => {
    const s = (sp.get("status") ?? initialStatus) as StatusFilter;
    return s;
  }, [sp, initialStatus]);

  function navigate(nextStatus: StatusFilter, nextQ: string) {
    const params = new URLSearchParams();
    if (nextStatus !== "all") params.set("status", nextStatus);
    if (nextQ.trim()) params.set("q", nextQ.trim());
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const pillBase =
    "px-3 py-1 rounded-full text-sm transition bg-gray-900 text-gray-300 hover:text-white border border-gray-700";
  const pillActive = "bg-gray-700 text-white border-gray-600";

  const pills: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "live", label: "Live" },
    { key: "upcoming", label: "Upcoming" },
    { key: "finished", label: "Finished" },
  ];

  return (
    <div className="rounded-2xl bg-gray-800 p-4 shadow space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {pills.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => navigate(p.key, q)}
            className={`${pillBase} ${status === p.key ? pillActive : ""}`}
          >
            {p.label}
          </button>
        ))}

        <div className="flex-1" />

        <form
          className="w-full sm:w-72"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(status, q);
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search opponent, tournament…"
            className="w-full rounded-xl bg-gray-900 px-4 py-2 text-gray-100 placeholder:text-gray-500 outline-none border border-gray-700 focus:border-gray-500
                       focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          />
        </form>
      </div>
    </div>
  );
}
