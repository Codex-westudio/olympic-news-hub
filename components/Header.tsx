"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface HeaderProps {
  isAuthenticated: boolean;
}

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/widgets", label: "Widget builder" },
  { href: "/auth", label: "Auth" },
];

export function Header({ isAuthenticated }: HeaderProps) {
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
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="rounded-full border border-gold px-3 py-1 text-gold"
            >
              Dashboard
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
