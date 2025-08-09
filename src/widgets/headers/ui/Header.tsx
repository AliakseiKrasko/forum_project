"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Tab({ href, children }: { href: string; children: React.ReactNode }) {
    const pathname = usePathname();
    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
        <Link
            href={href}
            className={`px-3 py-2 text-sm font-medium transition
        ${active ? "text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"}`}
        >
      <span className="relative">
        {children}
          {active && <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded bg-blue-600" />}
      </span>
        </Link>
    );
}

export default function Header() {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur dark:bg-neutral-950/70">
            <nav className="container mx-auto flex h-14 items-center gap-4">
                <Link href="/" className="mr-2 text-base font-semibold">Forum</Link>
                <Tab href="/">Post feed</Tab>
                <Tab href="/favorites">Favorites</Tab>
                <div className="ml-auto" />
            </nav>
        </header>
    );
}