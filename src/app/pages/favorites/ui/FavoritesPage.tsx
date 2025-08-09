"use client";
import React from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/store";
import { useGetPostsQuery, type Post } from "@/store/services/forumApi";
import PostCard from "@/entities/post/ui/PostCard";

export default function FavoritesPage() {
    const favIds = useAppSelector((s) => s.ui.favorites);
    const created = useAppSelector((s) => s.ui.createdPosts ?? []);
    const { data: serverPosts, isLoading } = useGetPostsQuery();

    // индекс по id из "серверных + локально созданных"
    const byId = React.useMemo(() => {
        const map = new Map<number, Post>();
        (serverPosts ?? []).forEach((p) => map.set(p.id, p));
        created.forEach((p) => map.set(p.id, p));
        return map;
    }, [serverPosts, created]);

    // берём посты в порядке их добавления в избранное
    const favPosts = favIds
        .map((id) => byId.get(id))
        .filter(Boolean) as Post[];

    return (
        <main className="container mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Favorites</h1>

            {isLoading && favPosts.length === 0 ? (
                <p>Loading…</p>
            ) : favPosts.length === 0 ? (
                <EmptyState />
            ) : (
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {favPosts.map((p) => (
                        <PostCard key={p.id} post={p} />
                    ))}
                </ul>
            )}
        </main>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl border p-8 text-center text-neutral-500">
            Список пуст. Добавьте посты в избранное из ленты.
        </div>
    );
}
