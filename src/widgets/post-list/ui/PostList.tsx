"use client";
import React from "react";
import { useAppSelector } from "@/store/store";
import { useGetPostsQuery } from "@/store/services/forumApi";
import { PostCard } from "@/entities/post";

export default function PostList() {
    const filter = useAppSelector((s) => s.ui.filterUserId);
    const { data: posts, isLoading } = useGetPostsQuery(filter);

    if (isLoading) return <div className="p-6">Loading…</div>;

    return (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts?.map((p) => <PostCard key={p.id} post={p} />)}
        </ul>
    );
}