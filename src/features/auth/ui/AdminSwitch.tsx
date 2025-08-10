"use client";

import React from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setAuth, logout } from "@/store/slices/uiSlice";

export default function AdminSwitch() {
    const dispatch = useAppDispatch();
    const auth = useAppSelector((s) => s.ui.auth);
    const isAdmin = auth.loggedIn && auth.userId === 1;

    const handleLoginAsAdmin = () => {
        // простая авторизация для демо/теста
        dispatch(setAuth({ loggedIn: true, userId: 1 }));
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <div className="flex items-center gap-2">
            {isAdmin ? (
                <>
                    <Link
                        href="/profile/admin"
                        className="rounded-lg border px-3 py-1 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                        Admin panel
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="rounded-lg border px-3 py-1 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        title="Logout"
                    >
                        Logout
                    </button>
                </>
            ) : auth.loggedIn ? (
                <button
                    onClick={handleLogout}
                    className="rounded-lg border px-3 py-1 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    title="Logout"
                >
                    Logout
                </button>
            ) : (
                <button
                    onClick={handleLoginAsAdmin}
                    className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    title="Login as admin"
                >
                    Login as admin
                </button>
            )}
        </div>
    );
}
