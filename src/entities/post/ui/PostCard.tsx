"use client";
import React from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { toggleDislike, toggleFavorite, toggleLike, removeCreatedPost } from "@/store/slices/uiSlice";
import { forumApi, useDeletePostMutation, useGetUsersQuery, type User } from "@/store/services/forumApi"; // 👈 добавили useGetUsersQuery, User
import type { Post } from "@/store/services/forumApi";

// генерим url аватарки (детерминированный по email/ID)
function avatarUrl(user?: User, fallbackSeed?: number) {
    const seed = user?.email ?? `user-${user?.id ?? fallbackSeed ?? 0}`;
    return `https://i.pravatar.cc/64?u=${encodeURIComponent(seed)}`;
}

function preview(id: number) {
    return `https://picsum.photos/seed/${id}/320/200`;
}

export default function PostCard({ post }: { post: Post }) {
    const dispatch = useAppDispatch();
    const reaction = useAppSelector((s) => s.ui.reactions[post.id] ?? 0);
    const isFav = useAppSelector((s) => s.ui.favorites.includes(post.id));
    const isLocal = useAppSelector((s) => s.ui.createdPosts.some((p) => p.id === post.id));
    const [deletePost, { isLoading: removing }] = useDeletePostMutation();

    // 👇 тянем пользователей один раз (RTK Query закеширует)
    const { data: users } = useGetUsersQuery();
    const user = users?.find((u) => u.id === post.userId);

    const liked = reaction === 1;
    const disliked = reaction === -1;
    const prefetch = () => dispatch(forumApi.util.prefetch("getPost", post.id, { force: false }));

    const handleDelete = async () => {
        if (isLocal) {
            dispatch(removeCreatedPost(post.id));
            dispatch(forumApi.util.updateQueryData("getPosts", undefined, (d) => {
                const i = d.findIndex((p) => p.id === post.id);
                if (i >= 0) d.splice(i, 1);
            }));
            if (post.userId) {
                dispatch(forumApi.util.updateQueryData("getPosts", post.userId, (d) => {
                    const i = d.findIndex((p) => p.id === post.id);
                    if (i >= 0) d.splice(i, 1);
                }));
            }
            return;
        }
        try { await deletePost(post.id).unwrap(); } catch {}
    };

    return (
        <li className="group overflow-hidden rounded-2xl border bg-white/80 shadow-sm transition hover:shadow-lg dark:bg-neutral-900">
            <div className="grid grid-cols-[1fr,128px] gap-4 p-4">
                <div className="min-w-0">
                    {/* meta */}
                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                        {/* 👇 аватарка автора */}
                        <img
                            src={avatarUrl(user, post.userId)}
                            alt={user?.name ?? `User ${post.userId}`}
                            className="size-8 rounded-full object-cover"
                            loading="lazy"
                        />
                        <div className="truncate">
                            <div className="font-medium text-neutral-800 dark:text-neutral-200">
                                {user?.name ?? `User ${post.userId}`}
                            </div>
                            <div className="text-xs">
                                ~ just now · {isLocal ? "local" : "api"}
                            </div>
                        </div>
                    </div>

                    {/* title */}
                    <Link
                        href={`/posts/${post.id}`}
                        onMouseEnter={prefetch}
                        onFocus={prefetch}
                        className="mt-3 block text-lg font-semibold leading-6 text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50"
                    >
                        {post.title}
                    </Link>

                    {/* excerpt */}
                    <p className="mt-2 text-sm leading-6 text-neutral-600 line-clamp-3 dark:text-neutral-300">
                        {post.body}
                    </p>

                    {/* actions */}
                    <div className="mt-4 flex items-center gap-2">
                        <button
                            className={`rounded-full border px-3 py-1 text-sm ${liked ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
                            onClick={() => dispatch(toggleLike(post.id))}
                            aria-pressed={liked}
                            title="Like"
                        >
                            👍
                        </button>
                        <button
                            className={`rounded-full border px-3 py-1 text-sm ${disliked ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
                            onClick={() => dispatch(toggleDislike(post.id))}
                            aria-pressed={disliked}
                            title="Dislike"
                        >
                            👎
                        </button>
                        <button
                            className={`ml-1 rounded-full border px-3 py-1 text-sm ${isFav ? "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
                            onClick={() => dispatch(toggleFavorite(post.id))}
                            title="Favorite"
                        >
                            ⭐ {isFav ? "In fav" : "Add"}
                        </button>

                        <div className="ml-auto flex items-center gap-2">
                            <Link href={`/posts/${post.id}`} className="text-sm text-blue-600 hover:underline">Open</Link>
                            <Link href="#" onClick={(e)=>e.preventDefault()} className="rounded border px-2 py-1 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Edit</Link>
                            <button onClick={handleDelete} disabled={removing} className="rounded border px-2 py-1 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* right preview */}
                <div className="relative h-[120px] w-[128px] overflow-hidden rounded-xl">
                    <img src={preview(post.id)} alt="" className="size-full object-cover transition group-hover:scale-105" />
                </div>
            </div>
        </li>
    );
}
