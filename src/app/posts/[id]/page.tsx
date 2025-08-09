"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/store/store";
import { useGetPostQuery, useGetCommentsQuery } from "@/store/services/forumApi";

export default function PostPage() {
    const { id } = useParams<{ id: string }>();
    const pid = Number(id);

    // 1) ищем среди локально созданных (persist в ui.createdPosts)
    const localPost = useAppSelector((s) =>
        s.ui.createdPosts.find((p) => p.id === pid)
    );

    // 2) если пост локальный (или временный id < 0), пропускаем запрос к серверу
    const { data: serverPost, isLoading, isError } = useGetPostQuery(pid, {
        skip: Boolean(localPost) || pid < 0,
    });

    const post = localPost ?? serverPost;

    // комменты запрашиваем только если пост не локальный
    const { data: comments } = useGetCommentsQuery(pid, {
        skip: Boolean(localPost) || pid < 0,
    });

    if (!post && isLoading) return <main className="p-6">Loading…</main>;
    if (!post && isError) return <main className="p-6">Пост не найден</main>;
    if (!post) return <main className="p-6">Поста нет</main>;

    return (
        <main className="container mx-auto p-6 space-y-6">
            <Link href="/" className="underline">&larr; Назад</Link>

            <article className="prose dark:prose-invert max-w-none">
                <h1>{post.title}</h1>
                <p>{post.body}</p>
            </article>

            {!localPost && (
                <section>
                    <h2 className="text-xl font-semibold mb-2">Comments</h2>
                    <ul className="space-y-3">
                        {comments?.map((c) => (
                            <li key={c.id} className="border rounded p-3">
                                <div className="font-medium">{c.email}</div>
                                <div>{c.body}</div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </main>
    );
}
