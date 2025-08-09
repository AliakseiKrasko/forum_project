"use client";

import React from "react";
import { useGetPostsQuery, useGetUsersQuery } from "@/store/services/forumApi";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setFilterUser } from "@/store/slices/uiSlice";

export default function Home() {
    const dispatch = useAppDispatch();
    const filter = useAppSelector(s => s.ui.filterUserId);
    const { data: users } = useGetUsersQuery();
    const { data: posts } = useGetPostsQuery(filter);

    return (
        <main className="container mx-auto p-6 space-y-6">
            <div className="flex gap-4 items-center">
                <select
                    className="border rounded p-2"
                    value={filter ?? ""}
                    onChange={e => dispatch(setFilterUser(e.target.value ? Number(e.target.value) : undefined))}
                >
                    <option value="">Все пользователи</option>
                    {users?.map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}
                </select>
            </div>

            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts?.map(p => (
                    <li key={p.id} className="border rounded p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{p.title}</h3>
                        <p className="line-clamp-3 text-sm opacity-80">{p.body}</p>
                        <Link className="underline mt-2 inline-block" href={`/posts/${p.id}`}>Открыть</Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}