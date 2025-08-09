"use client";
import { useParams } from "next/navigation";
import { useGetCommentsQuery, useGetPostQuery } from "@/store/services/forumApi";

export default function PostPage(){
    const { id } = useParams<{ id: string }>();
    const pid = Number(id);
    const { data: post } = useGetPostQuery(pid);
    const { data: comments } = useGetCommentsQuery(pid);

    if(!post) return <div className="p-6">Загрузка…</div>;
    return (
        <main className="container mx-auto p-6 space-y-6">
            <article className="prose dark:prose-invert max-w-none">
                <h1>{post.title}</h1>
                <p>{post.body}</p>
            </article>
            <section>
                <h2 className="text-xl font-semibold mb-2">Комментарии</h2>
                <ul className="space-y-3">
                    {comments?.map(c => (
                        <li key={c.id} className="border rounded p-3">
                            <div className="font-medium">{c.email}</div>
                            <div>{c.body}</div>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}