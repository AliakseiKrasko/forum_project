"use client";
import React from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { toggleDislike, toggleFavorite, toggleLike } from "@/store/slices/uiSlice";
import {Post, useDeletePostMutation} from "@/store/services/forumApi";
import {toast} from "sonner";
import {EditPostDialog} from "@/features/edit-post";

export default function PostCard({ post }: { post: Post }) {
    const dispatch = useAppDispatch();
    const reaction = useAppSelector((s) => s.ui.reactions[post.id] ?? 0);
    const isFav = useAppSelector((s) => s.ui.favorites.includes(post.id));

    const [deletePost, { isLoading: removing }] = useDeletePostMutation();

    const liked = reaction === 1;
    const disliked = reaction === -1;

    return (
        <li className="border rounded p-4 space-y-2 flex flex-col h-full">
            <h3 className="font-semibold line-clamp-2">{post.title}</h3>
            <p className="line-clamp-3 text-sm opacity-80">{post.body}</p>

            <div className="flex items-center gap-2">
                <button
                    className="rounded border px-2 py-1"
                    onClick={() => dispatch(toggleLike(post.id))}
                    aria-pressed={liked}
                >
                    👍 {liked ? "Liked" : ""}
                </button>
                <button
                    className="rounded border px-2 py-1"
                    onClick={() => dispatch(toggleDislike(post.id))}
                    aria-pressed={disliked}
                >
                    👎 {disliked ? "Disliked" : ""}
                </button>
                <button
                    className="ml-auto rounded border px-2 py-1"
                    onClick={() => dispatch(toggleFavorite(post.id))}
                    aria-label="toggle favorite"
                >
                    ⭐ {isFav ? "In fav" : "Add"}
                </button>
            </div>

            {/* Блок уходит в самый низ */}
            <div className="mt-auto flex justify-between">
                {/* Open слева */}
                <Link
                    className="underline inline-block mr-2"
                    href={`/posts/${post.id}`}
                >
                    Open
                </Link>

                {/* Edit + Delete справа */}
                <div className="flex items-center gap-2">
                    <EditPostDialog post={post} />
                    <button
                        className="rounded border px-2 py-1 cursor-pointer"
                        onClick={async () => {
                            try {
                                await deletePost(post.id).unwrap();
                                toast.success("Post deleted");
                            } catch {
                                toast.error("Unable to delete");
                            }
                        }}
                        disabled={removing}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </li>
    );
}

