"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/features/theme/ui/ThemeToggle";
import AvatarMenu from "@/features/auth/ui/AvatarMenu";
import AdminSwitch from "@/features/auth/ui/AdminSwitch";
import {useAppSelector} from "@/store/store";

function Tab({ href, children }: { href: string; children: React.ReactNode }) {
    const pathname = usePathname();
    const active =
        href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={`px-3 py-2 text-sm font-medium transition ${
                active
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
        >
      <span className="relative">
        {children}
          {active && (
              <span className="pointer-events-none absolute bottom-0 left-0 right-0 h-0.5 rounded bg-blue-600" />
          )}
      </span>
        </Link>
    );
}

export default function Header() {
    const [open, setOpen] = useState(false);
    const loggedIn = useAppSelector((s) => s.ui.auth.loggedIn);


    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-neutral-950/70">
            <nav className="container mx-auto flex min-h-14 items-center gap-3 px-4 md:px-6">
                {/* Лого/название */}
                <Link href="/" className="mr-1 text-base font-semibold">
                    Forum
                </Link>

                {/* Десктопные вкладки (>= 801px) */}
                <div className="hidden min-[801px]:flex items-center">
                    <Tab href="/">Post feed</Tab>
                    <Tab href="/favorites">Favorites</Tab>
                    <Tab href="/profile">Profile</Tab>
                </div>

                {/* Правый блок */}
                <div className="ml-auto flex items-center gap-2">
                    <ThemeToggle />

                    {/* Аватар всегда видимый */}
                    {loggedIn && (

                            <AvatarMenu />

                    )}

                    {/* AdminSwitch только на >= 801px, в мобилке уедет в меню */}
                    <div className="hidden min-[801px]:block">
                        <AdminSwitch />
                    </div>

                    {/* Кнопка бургера только < 800px */}
                    <button
                        type="button"
                        aria-label="Open menu"
                        aria-controls="mobile-menu"
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                        className="min-[801px]:hidden inline-flex h-9 w-9 items-center justify-center rounded-md ring-1 ring-neutral-200 hover:bg-neutral-100 active:scale-95 dark:ring-neutral-800 dark:hover:bg-neutral-900"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5"
                        >
                            {open ? (
                                <path
                                    fillRule="evenodd"
                                    d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.361a1 1 0 1 1 1.414 1.414L13.414 10.586l4.361 4.361a1 1 0 0 1-1.414 1.414L12 12l-4.361 4.361a1 1 0 0 1-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 0 1 0-1.414Z"
                                    clipRule="evenodd"
                                />
                            ) : (
                                <path d="M3.75 5.25h16.5v1.5H3.75v-1.5Zm0 6h16.5v1.5H3.75v-1.5Zm0 6h16.5v1.5H3.75v-1.5Z" />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Мобильное меню */}
            <div
                id="mobile-menu"
                className={`min-[801px]:hidden ${
                    open ? "block" : "hidden"
                } border-t bg-white/95 backdrop-blur dark:bg-neutral-950/95`}
            >
                <div className="container mx-auto px-4 py-2 md:px-6">
                    <div className="flex flex-col">
                        <Tab href="/">Post feed</Tab>
                        <Tab href="/favorites">Favorites</Tab>
                        <Tab href="/profile">Profile</Tab>

                        <div className="mt-2">
                            <AdminSwitch />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
