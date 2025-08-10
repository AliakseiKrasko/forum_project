"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/store/store";
import { useGetPostQuery } from "@/store/services/forumApi";
import CommentsSection from "@/features/comments/CommentsSection";

export default function PostPage() {
    const { id } = useParams<{ id: string }>();
    const pid = Number(id);
    const isTemp = Number.isNaN(pid) || pid < 0;

    // 1) локальный пост (создан на клиенте и сохранён в ui.createdPosts)
    const localPost = useAppSelector((s) => s.ui.createdPosts.find((p) => p.id === pid));

    // 2) серверный пост (если не временный id и не нашли локальный)
    const { data: serverPost, isLoading, isError } = useGetPostQuery(pid, {
        skip: Boolean(localPost) || isTemp,
    });

    const post = localPost ?? serverPost;

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

            {/* Доп. блок для локальных постов */}
            {isTemp && (
                <div className="rounded border p-3 text-sm text-neutral-600 dark:text-neutral-300">
                    Это локальный пост. Комментарии сохраняются только на этой машине.
                </div>
            )}

            {/* 👉 Вставляем секцию комментариев.
          Для временных id (локальных) пропускаем API */}
            <CommentsSection postId={pid} skipApi={isTemp} />
        </main>
    );
}
