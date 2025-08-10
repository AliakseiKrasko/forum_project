"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { logout } from "@/store/slices/uiSlice";

export default function AvatarMenu() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const profile = useAppSelector((s) => s.ui.profile);
    const loggedIn = useAppSelector((s) => s.ui.auth.loggedIn);

    // Плейсхолдеры
    const name = profile?.name ?? "Guest";
    const avatarSrc =
        profile?.avatarUrl ||
        `https://i.pravatar.cc/32?u=${encodeURIComponent(profile?.email ?? "guest")}`;

    const [open, setOpen] = React.useState(false);
    const btnRef = React.useRef<HTMLButtonElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Клик вне
    React.useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!open) return;
            const t = e.target as Node;
            if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
            setOpen(false);
        }
        function onEsc(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    const onLogout = () => {
        dispatch(logout());
        setOpen(false);
        router.push("/");
    };

    if (!loggedIn) {
        // Если не залогинен — просто кнопка Login может быть в другом месте
        return null;
    }

    return (
        <div className="relative ">
            <button
                ref={btnRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 border rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
                <img
                    src={avatarSrc}
                    alt="avatar"
                    className="size-8 rounded-full object-cover"
                />
                <span className="hidden text-sm sm:inline">Guest</span>
            </button>

            {open && (
                <div
                    ref={menuRef}
                    role="menu"
                    aria-label="User menu"
                    className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border bg-white shadow-lg dark:bg-neutral-900"
                >
                    <Link
                        href="/profile"
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                        Profile
                    </Link>
                    <button
                        role="menuitem"
                        onClick={onLogout}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}