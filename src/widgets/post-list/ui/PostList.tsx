"use client";
import React from "react";
import { useAppSelector } from "@/store/store";
import { useGetPostsQuery } from "@/store/services/forumApi";
import { PostCard } from "@/entities/post";

export default function PostList() {
    const filter = useAppSelector((s) => s.ui.filterUserId);
    const localCreated = useAppSelector((s) => s.ui.createdPosts ?? []); // 👈 безопасно
    const { data, isLoading } = useGetPostsQuery(filter);

    const serverPosts = data ?? [];
    const localFiltered = filter ? localCreated.filter(p => p.userId === filter) : localCreated;
    const merged = [
        ...localFiltered,
        ...serverPosts.filter(p => !localFiltered.some(lp => lp.id === p.id)),
    ];

    if (isLoading && merged.length === 0) return <div className="p-6">Загрузка…</div>;

    return (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {merged.map((p) => <PostCard key={p.id} post={p} />)}
        </ul>
    );
}
