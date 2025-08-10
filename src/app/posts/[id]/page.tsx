"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/store/store";
import {
    useGetPostQuery,
    useGetCommentsQuery,
} from "@/store/services/forumApi";
import AddComment from "@/features/comments/AddComment";

export default function PostPage() {
    const { id } = useParams<{ id: string }>();
    const pid = Number(id);
    const isTemp = Number.isNaN(pid) || pid < 0;

    // 1) локальный пост (создан на клиенте и сохранён в ui.createdPosts)
    const localPost = useAppSelector((s) =>
        s.ui.createdPosts.find((p) => p.id === pid)
    );

    // 2) серверный пост (если не временный id и не нашли локальный)
    const {
        data: serverPost,
        isLoading,
        isError,
    } = useGetPostQuery(pid, {
        skip: Boolean(localPost) || isTemp,
    });

    const post = localPost ?? serverPost;

    // 3) локальные комментарии из persist
    const localComments = useAppSelector(
        (s) => s.ui.createdComments?.[pid] ?? []
    );

    // 4) серверные комментарии — подгружаем всегда, если id валидный (даже при наличии localPost)
    const { data: serverComments } = useGetCommentsQuery(pid, {
        skip: isTemp,
    });

    // 5) merge без дублей (локальные сверху)
    const comments = React.useMemo(() => {
        const server = serverComments ?? [];
        if (!localComments.length) return server;
        const seen = new Set(localComments.map((c) => c.id));
        return [...localComments, ...server.filter((c) => !seen.has(c.id))];
    }, [localComments, serverComments]);

    if (!post && isLoading) return <main className="p-6">Loading…</main>;
    if (!post && isError) return <main className="p-6">Пост не найден</main>;
    if (!post) return <main className="p-6">Поста нет</main>;

    return (
        <main className="container mx-auto p-6 space-y-6">
            <Link href="/" className="underline">
                &larr; Назад
            </Link>

            <article className="prose dark:prose-invert max-w-none">
                <h1>{post.title}</h1>
                <p>{post.body}</p>
            </article>

            <section>
                <h2 className="mb-2 text-xl font-semibold">Comments</h2>

                {comments.length === 0 ? (
                    <p className="text-sm text-neutral-500">Пока нет комментариев</p>
                ) : (
                    <ul className="space-y-3 mb-6">
                        {comments.map((c) => (
                            <li key={c.id} className="rounded border p-3">
                                <div className="font-medium">
                                    {c.name ?? c.email ?? "Anon"}{" "}
                                    {c.email && (
                                        <span className="text-xs text-neutral-500">— {c.email}</span>
                                    )}
                                </div>
                                <div>{c.body}</div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* форму показываем всегда; для временных id просто будут добавляться локальные */}
                {!isTemp && <AddComment postId={pid} />}
                {isTemp && (
                    <div className="rounded border p-3 text-sm text-neutral-600 dark:text-neutral-300">
                        Это локальный пост. Комментарии сохраняются только на этой машине.
                        <div className="mt-3">
                            <AddComment postId={pid} />
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
