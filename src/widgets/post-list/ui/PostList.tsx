"use client";
import React from "react";
import { useAppSelector } from "@/store/store";
import { useGetPostsQuery } from "@/store/services/forumApi";


import FiltersBar from "@/features/posts/FiltersBar";
import { useDebounce } from "@/shared/lib/useDebounce";
import SkeletonPostList from "@/widgets/posts/SkeletonPostList";
import EmptyState from "@/shared/ui/EmptyState";
import ErrorState from "@/shared/ui/ErrorState";
import {PostCard} from "@/entities/post";

export default function PostList() {
    const filter = useAppSelector((s) => s.ui.filterUserId);
    const localCreated = useAppSelector((s) => s.ui.createdPosts ?? []);
    const { data, isLoading, isError, isFetching, refetch } = useGetPostsQuery(filter);

    // поиск
    const [query, setQuery] = React.useState("");
    const debounced = useDebounce(query, 300);
    const q = debounced.trim().toLowerCase();

    // merge локальных и серверных без дублей + сортировка по времени/id
    const merged = React.useMemo(() => {
        const serverPosts = data ?? [];
        const localFiltered = filter ? localCreated.filter((p) => p.userId === filter) : localCreated;
        const localIds = new Set(localFiltered.map((p) => p.id));
        const arr = [...localFiltered, ...serverPosts.filter((p) => !localIds.has(p.id))];

        arr.sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta || b.id - a.id;
        });
        return arr;
    }, [data, localCreated, filter]);

    // фильтрация по поиску (title/body)
    const visible = React.useMemo(() => {
        if (!q) return merged;
        return merged.filter(
            (p) =>
                p.title.toLowerCase().includes(q) ||
                p.body.toLowerCase().includes(q)
        );
    }, [merged, q]);

    // sticky-панель
    const toolbar = <FiltersBar query={query} onQueryChange={setQuery} />;

    // состояния
    if (isLoading && merged.length === 0) {
        return (
            <>
                {toolbar}
                <SkeletonPostList count={6} />
            </>
        );
    }
    if (isError && merged.length === 0) {
        return (
            <>
                {toolbar}
                <ErrorState onRetry={refetch} />
            </>
        );
    }
    if (visible.length === 0) {
        const isFiltered = typeof filter === "number" || q.length > 0;
        return (
            <>
                {toolbar}
                <EmptyState
                    title={isFiltered ? "Nothing found" : "No posts yet"}
                    message={
                        isFiltered
                            ? "Try another user or change your search query."
                            : "Create the first post to get started."
                    }
                />
            </>
        );
    }

    // список (адаптив: 1 кол. на мобиле, 2 на sm, 3 на lg)
    return (
        <>
            {toolbar}
            {isFetching && (
                <div className="mb-2 text-sm text-neutral-500" aria-live="polite">
                    Updating…
                </div>
            )}
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((p) => (
                    <PostCard key={p.id} post={p} />
                ))}
            </ul>
        </>
    );
}
