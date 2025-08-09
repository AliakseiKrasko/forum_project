"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    const pathname = usePathname();
    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
        <Link href={href} className={`px-3 py-2 rounded-md text-sm font-medium ${active ? "bg-foreground/10" : "hover:bg-foreground/10"}`} aria-current={active ? "page" : undefined}>
            {children}
        </Link>
    );
}

export default function Header() {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
            <nav className="container mx-auto flex h-14 items-center gap-2">
                <Link href="/" className="mr-14 font-semibold">Forum</Link>
                <NavLink href="/">Post feed</NavLink>
                <NavLink href="/favorites">Favorites</NavLink>
            </nav>
        </header>
    );
}