"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { toggleDark } from "@/store/slices/uiSlice";

export default function ThemeToggle() {
    const dispatch = useAppDispatch();
    const dark = useAppSelector(s => s.ui.dark);

    useEffect(() => {
        const root = document.documentElement;
        dark ? root.classList.add("dark") : root.classList.remove("dark");
    }, [dark]);

    return (
        <button
            aria-label="Toggle theme"
            onClick={() => dispatch(toggleDark())}
            className="rounded-full border px-3 py-1 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-600"
            title={dark ? "Switch to light" : "Switch to dark"}
        >
            {dark ? "🌙" : "☀️"}
        </button>
    );
}
