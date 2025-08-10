"use client";
import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { shallowEqual } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
    toggleDislike,
    toggleFavorite,
    toggleLike,
    removeCreatedPost,
} from "@/store/slices/uiSlice";
import {
    forumApi,
    useDeletePostMutation,
    useGetUsersQuery,
    useUpdatePostMutation,
    useGetCommentsQuery,
    type User,
    type Post,
} from "@/store/services/forumApi";
import { EditPostDialog } from "@/features/edit-post";
import PostActions from "@/entities/post/ui/PostActions";
import {makeSelectPostUi} from "@/entities/post/model/selectors";
// import { makeSelectPostUi } from "@/entities/post/selectors";

// helpers
function avatarUrl(user?: User, fallbackSeed?: number) {
    const seed = user?.email ?? `user-${user?.id ?? fallbackSeed ?? 0}`;
    return `https://i.pravatar.cc/64?u=${encodeURIComponent(seed)}`;
}
function preview(id: number) {
    return `https://picsum.photos/seed/${id}/320/200`;
}

type Props = { post: Post };

function PostCard({ post }: Props) {
    const dispatch = useAppDispatch();

    // ✅ мемо-селектор только для нужных полей карточки
    const selectPostUi = React.useMemo(makeSelectPostUi, []);
    const { reaction, isFav, isLocal, localComments } = useAppSelector(
        (s) => selectPostUi(s, post.id),
        shallowEqual
    );

    // 💬 счётчик комментариев (API + локальные)
    const { data: apiComments } = useGetCommentsQuery(post.id);
    const commentsCount = (apiComments?.length ?? 0) + localComments;

    const [deletePost, { isLoading: removing }] = useDeletePostMutation();
    const [updatePost] = useUpdatePostMutation(); // оставил, если правишь в модалке

    // автор поста
    const { data: users } = useGetUsersQuery();
    const user = users?.find((u) => u.id === post.userId);

    const liked = reaction === 1;
    const disliked = reaction === -1;
    const likeCount = (post.likes ?? 0) + (liked ? 1 : 0);

    const createdAt = post.createdAt ? new Date(post.createdAt) : undefined;
    const timeAgo = createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : "just now";

    // ✅ prefetch через хуки RTK Query (и пост, и комменты)
    const prefetchPost = forumApi.usePrefetch("getPost");
    const prefetchComments = forumApi.usePrefetch("getComments");
    const prefetch = React.useCallback(() => {
        prefetchPost(post.id);
        prefetchComments(post.id);
    }, [prefetchPost, prefetchComments, post.id]);

    const handleDelete = async () => {
        if (isLocal) {
            // локальный — просто вычищаем
            dispatch(removeCreatedPost(post.id));
            dispatch(
                forumApi.util.updateQueryData("getPosts", undefined, (d) => {
                    const i = d.findIndex((p) => p.id === post.id);
                    if (i >= 0) d.splice(i, 1);
                })
            );
            if (post.userId) {
                dispatch(
                    forumApi.util.updateQueryData("getPosts", post.userId, (d) => {
                        const i = d.findIndex((p) => p.id === post.id);
                        if (i >= 0) d.splice(i, 1);
                    })
                );
            }
            return;
        }
        try {
            await deletePost(post.id).unwrap();
        } catch {
            /* ignore */
        }
    };

    return (
        <li className="group h-full overflow-hidden rounded-2xl border bg-white/80 shadow-sm transition hover:shadow-lg dark:bg-neutral-900">
            <div className="grid h-full grid-cols-[1fr,128px] gap-4 p-4">
                {/* левая колонка — растяжка на высоту */}
                <div className="min-w-0 flex flex-col">
                    {/* meta */}
                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                        <img
                            src={avatarUrl(user, post.userId)}
                            alt={user?.name ?? `User ${post.userId}`}
                            className="size-8 rounded-full object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="truncate">
                            <div className="font-medium text-neutral-800 dark:text-neutral-200">
                                {user?.name ?? `User ${post.userId}`}
                            </div>
                            <div className="text-xs">~ {timeAgo} · {isLocal ? "local" : "api"}</div>
                        </div>
                    </div>

                    {/* title */}
                    <Link
                        data-testid="post-title-link"
                        href={`/posts/${post.id}`}
                        onMouseEnter={prefetch}
                        onFocus={prefetch}
                        className="mt-3 block text-lg font-semibold leading-6 text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50"
                    >
                        {post.title}
                    </Link>

                    {/* excerpt */}
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                        {post.body}
                    </p>

                    {/* actions */}
                    <PostActions
                        liked={liked}
                        disliked={disliked}
                        fav={isFav}
                        likeCount={likeCount}
                        commentsCount={commentsCount}
                        onLike={() => dispatch(toggleLike(post.id))}
                        onDislike={() => dispatch(toggleDislike(post.id))}
                        onFav={() => dispatch(toggleFavorite(post.id))}
                        openHref={`/posts/${post.id}`}
                        onOpenPrefetch={prefetch}
                        editButton={<EditPostDialog post={post} />}
                        onDelete={handleDelete}
                        deleting={removing}
                    />
                </div>

                {/* правая колонка — превью */}
                <div className="relative h-[120px] w-[128px] overflow-hidden rounded-xl">
                    <img
                        src={preview(post.id)}
                        alt=""
                        className="size-full object-cover transition group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
            </div>
        </li>
    );
}

// ✅ мемо: карточка не будет перерисовываться без изменения своих пропов/селектов
export default React.memo(PostCard);
