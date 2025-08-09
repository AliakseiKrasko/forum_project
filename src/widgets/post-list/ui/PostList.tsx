"use client";
import React from "react";
import { useAppSelector } from "@/store/store";
import { useGetPostsQuery } from "@/store/services/forumApi";
import { PostCard } from "@/entities/post";

export default function PostList() {
    const filter = useAppSelector((s) => s.ui.filterUserId);
    const localCreated = useAppSelector((s) => s.ui.createdPosts ?? []);
    const { data, isLoading } = useGetPostsQuery(filter);

    const serverPosts = data ?? [];
    const localFiltered = filter ? localCreated.filter(p => p.userId === filter) : localCreated;
    const merged = [...localFiltered, ...serverPosts.filter(p => !localFiltered.some(lp => lp.id === p.id))];

    if (isLoading && merged.length === 0) {
        return (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({length: 6}).map((_,i)=>(
                    <li key={i} className="animate-pulse rounded-2xl border bg-white/60 p-4 dark:bg-neutral-900">
                        <div className="mb-3 h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
                        <div className="mb-2 h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-4 w-5/6 rounded bg-neutral-200 dark:bg-neutral-700" />
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {merged.map((p) => <PostCard key={p.id} post={p} />)}
        </ul>
    );
}
