"use client";
import { useAppSelector } from "@/store/store";
import { useGetPostsQuery } from "@/store/services/forumApi";
import Link from "next/link";

export default function FavoritesPage(){
    const fav = useAppSelector(s => s.ui.favorites);
    const { data: posts } = useGetPostsQuery();
    const favPosts = (posts ?? []).filter(p => fav.includes(p.id));
    return (
        <main className="container mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Favorites</h1>
            {favPosts.length === 0 ? <p>Empty for now</p> : (
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favPosts.map(p => (
                        <li key={p.id} className="border rounded p-4">
                            <h3 className="font-semibold mb-2">{p.title}</h3>
                            <Link className="underline" href={`/posts/${p.id}`}>Open</Link>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}