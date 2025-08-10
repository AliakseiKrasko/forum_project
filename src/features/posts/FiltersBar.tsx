"use client";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setFilterUser } from "@/store/slices/uiSlice";
import { useGetUsersQuery } from "@/store/services/forumApi";

type Props = {
    query: string;
    onQueryChange: (v: string) => void;
};

export default function FiltersBar({ query, onQueryChange }: Props) {
    const dispatch = useAppDispatch();
    const userFilter = useAppSelector((s) => s.ui.filterUserId);
    const { data: users } = useGetUsersQuery();

    const resetAll = () => {
        dispatch(setFilterUser(undefined));
        onQueryChange("");
    };

    return (
        <div
            className="
        sticky top-[64px] z-20 mb-4
        rounded-2xl border bg-white/80 p-3 backdrop-blur
        dark:bg-neutral-900
        supports-[backdrop-filter]:bg-white/60
      "
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* фильтр по пользователю */}
                <select
                    className="h-10 rounded-lg border px-3 text-sm outline-none focus:border-blue-500"
                    value={userFilter ?? ""}
                    onChange={(e) =>
                        dispatch(setFilterUser(e.target.value ? Number(e.target.value) : undefined))
                    }
                    aria-label="Filter by user"
                >
                    <option value="">All users</option>
                    {users?.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name}
                        </option>
                    ))}
                </select>

                {/* поиск */}
                <input
                    className="h-10 w-full sm:flex-1 sm:min-w-0 rounded-lg border px-3 text-sm outline-none focus:border-blue-500"
                    placeholder="Search in title or body…"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    aria-label="Search posts"
                />

                {/* сброс */}
                <button
                    onClick={resetAll}
                    className="h-10 rounded-lg border px-4 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
