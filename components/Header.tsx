"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import type { ProfilePlan } from "@/lib/profile";

interface HeaderProps {
  isAuthenticated: boolean;
  profile: ProfilePlan | null;
  isAdmin?: boolean;
}

const navLinks = [
  { href: "/#plans", label: "Plans" },
  { href: "/widgets", label: "Widgets" },
];

export function Header({ isAuthenticated, profile, isAdmin = false }: HeaderProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-midnight">
          Olympic News Hub
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx("rounded-full px-3 py-1", {
                "bg-midnight text-white": isActive(link.href),
                "hover:bg-slate-100 hover:text-slate-900": !isActive(link.href),
              })}
            >
              {link.label}
            </Link>
          ))}
          {profile && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Plan {profile.plan}
            </span>
          )}
          {isAuthenticated ? (
            <Link
              href="/auth"
              className="rounded-full border border-midnight px-4 py-1 text-sm font-semibold text-midnight transition hover:bg-midnight hover:text-white"
            >
              Mon espace
            </Link>
          ) : (
            <Link
              href="/auth"
              className="rounded-full border border-midnight px-4 py-1 text-sm font-semibold text-midnight transition hover:bg-midnight hover:text-white"
            >
              Se connecter
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full border border-gold px-3 py-1 text-sm font-semibold text-gold"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
