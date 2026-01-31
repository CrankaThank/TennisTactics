"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();

  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  const base =
    "text-sm whitespace-nowrap px-2 py-1 rounded-md transition outline-none";
  const active = "text-white bg-white/10";
  const inactive = "text-gray-300 hover:text-white hover:bg-white/5";
  const focus =
    "focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900";

  return (
    <Link
      href={href}
      className={`${base} ${isActive ? active : inactive} ${focus}`}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

export function TopNav() {
  return (
    <div className="max-w-full overflow-x-auto">
      <div className="flex items-center gap-4 sm:gap-6">
        <NavLink href="/" label="Home" />
        <NavLink href="/matches" label="Matches" />
        <NavLink href="/rankings" label="Rankings" />
        <NavLink href="/tournaments" label="Tournaments" />
        <NavLink href="/players" label="Players" />
      </div>
    </div>
  );
}
