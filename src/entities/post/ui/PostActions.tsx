"use client";
import React from "react";
import Link from "next/link";

type Props = {
    liked: boolean;
    disliked: boolean;
    fav: boolean;
    likeCount: number;
    commentsCount: number;

    onLike: () => void;
    onDislike: () => void;
    onFav: () => void;

    openHref: string;
    onOpenPrefetch?: () => void;

    editButton?: React.ReactNode;

    onDelete: () => void;
    deleting?: boolean;
};

export default React.memo(function PostActions({
                                                   liked, disliked, fav, likeCount, commentsCount,
                                                   onLike, onDislike, onFav,
                                                   openHref, onOpenPrefetch,
                                                   editButton, onDelete, deleting,
                                               }: Props) {
    return (
        <div className="mt-auto flex items-center gap-2 pt-4 flex-nowrap">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
            <Action label="Like" ariaPressed={liked} active={liked} onClick={onLike} className="like-btn">
                👍 <span className="ml-1 tabular-nums">{likeCount}</span>
            </Action>

            <Action label="Dislike" ariaPressed={disliked} active={disliked} onClick={onDislike} className="dislike-btn">
                👎
            </Action>

            <Action
                label="Favorite"
                ariaPressed={fav}
                active={fav}
                onClick={onFav}
                activeClass="border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30"
            >
                ⭐ <span className="ml-1">{fav ? "In fav" : "Add"}</span>
            </Action>

            {/* Счётчик комментов тем же стилем, без кнопки */}
            <Link
                className="inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs"
                aria-label="Comments"
                title="Comments"
                href={openHref}
                onMouseEnter={onOpenPrefetch}
                onFocus={onOpenPrefetch}
            >
                💬 <span className="tabular-nums">{commentsCount}</span>
            </Link>
            </div>

            <div className="ml-auto flex items-center gap-2">
                {editButton}

                <button
                    onClick={onDelete}
                    disabled={deleting}
                    className="h-8 rounded-md border px-3 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-60"
                    aria-label="Delete post"
                >
                    Delete
                </button>
            </div>
        </div>
    );
});

function Action({
                    children, label, ariaPressed, active, onClick,
                    className = "",
                    activeClass = "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30",
                }: {
    children: React.ReactNode;
    label: string;
    ariaPressed?: boolean;
    active?: boolean;
    onClick: () => void;
    className?: string;
    activeClass?: string;
}) {
    return (
        <button
            data-testid={`${label.toLowerCase()}-btn`}
            className={[
                "inline-flex h-8 items-center rounded-full border px-3 text-xs",
                active ? activeClass : "hover:bg-neutral-50 dark:hover:bg-neutral-800",
                className,
            ].join(" ")}
            onClick={onClick}
            aria-pressed={ariaPressed}
            aria-label={label}
            title={label}
        >
            {children}
        </button>
    );
}