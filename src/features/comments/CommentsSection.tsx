"use client";
import React from "react";
import { useAppSelector } from "@/store/store";
import { useGetCommentsQuery } from "@/store/services/forumApi";
import EmptyState from "@/shared/ui/EmptyState";
import ErrorState from "@/shared/ui/ErrorState";
import { Skeleton } from "@/shared/ui/Skeleton";
import AddComment from "@/features/comments/AddComment";

type Props = {
    postId: number;
    /** Если true — не дергаем API (например, для временных id) */
    skipApi?: boolean;
};

export default function CommentsSection({ postId, skipApi }: Props) {
    const localComments = useAppSelector((s) => s.ui.createdComments?.[postId] ?? []);
    const { data: serverComments, isLoading, isError, refetch } = useGetCommentsQuery(postId, {
        skip: !!skipApi,
    });

    // merge: локальные сверху, без дублей
    const comments = React.useMemo(() => {
        const server = serverComments ?? [];
        if (!localComments.length) return server;
        const seen = new Set(localComments.map((c) => c.id));
        return [...localComments, ...server.filter((c) => !seen.has(c.id))];
    }, [localComments, serverComments]);

    return (
        <section className="space-y-4" aria-labelledby="comments-title">
            <h2 id="comments-title" aria-label="Comments" className="text-lg font-semibold">
                Comments {comments.length > 0 && `(${comments.length})`}
            </h2>

            {isLoading && !comments.length ? (
                <ul className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <li key={i} className="rounded-xl border p-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="mb-2 h-4 w-40" />
                                    <Skeleton className="h-3 w-64" />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : isError && !comments.length ? (
                <ErrorState message="Failed to load comments." onRetry={refetch} />
            ) : !comments.length ? (
                <EmptyState title="No comments yet" message="Be the first to share your thoughts." />
            ) : (
                <ul className="space-y-3">
                    {comments.map((c) => (
                        <li key={c.id} className="rounded border p-3">
                            <div className="text-sm font-medium">{c.name ?? c.email ?? "Anon"}</div>
                            {c.email && <div className="text-xs text-neutral-500">{c.email}</div>}
                            <p className="mt-2 text-sm">{c.body}</p>
                        </li>
                    ))}
                </ul>
            )}

            <AddComment postId={postId} />
        </section>
    );
}
