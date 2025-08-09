import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    addCreatedPost,
    removeCreatedPost,
    updateCreatedPostId,
} from "@/store/slices/uiSlice";

export interface User {
    id: number;
    name: string;
    email: string;
    username: string;
}
export interface Post {
    id: number;
    userId: number;
    title: string;
    body: string;
    likes?: number;
}
export interface Comment {
    id: number;
    postId: number;
    name: string;
    email: string;
    body: string;
}

export const forumApi = createApi({
    reducerPath: "forumApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://jsonplaceholder.typicode.com",
    }),
    tagTypes: ["Posts", "Users", "Comments"],
    refetchOnFocus: false,
    refetchOnReconnect: false,

    endpoints: (build) => ({
        getUsers: build.query<User[], void>({
            query: () => "/users",
            providesTags: ["Users"],
        }),

        getPosts: build.query<Post[], number | void>({
            query: (userId) => (userId ? `/posts?userId=${userId}` : "/posts"),
            providesTags: ["Posts"],
        }),

        getPost: build.query<Post, number>({
            query: (id) => `/posts/${id}`,
            providesTags: (r, e, id) => [{ type: "Posts", id }],
        }),

        getComments: build.query<Comment[], number>({
            query: (postId) => `/comments?postId=${postId}`,
            providesTags: (r, e, id) => [{ type: "Comments", id }],
        }),

        // ------------ МУТАЦИИ ------------
        createPost: build.mutation<Post, Pick<Post, "title" | "body" | "userId">>({
            query: (body) => ({ url: "/posts", method: "POST", body }),
            async onQueryStarted(newPost, { dispatch, queryFulfilled }) {
                const tempId = -Date.now();

                const patchAll = dispatch(
                    forumApi.util.updateQueryData("getPosts", undefined, (draft) => {
                        draft.unshift({ id: tempId, ...newPost });
                    })
                );
                const patchUser = dispatch(
                    forumApi.util.updateQueryData(
                        "getPosts",
                        newPost.userId,
                        (draft) => {
                            draft.unshift({ id: tempId, ...newPost });
                        }
                    )
                );

                // persist локально
                dispatch(addCreatedPost({ id: tempId, ...newPost }));

                try {
                    const { data } = await queryFulfilled;

                    dispatch(
                        forumApi.util.updateQueryData("getPosts", undefined, (draft) => {
                            const i = draft.findIndex((p) => p.id === tempId);
                            if (i >= 0) draft[i].id = data.id;
                        })
                    );
                    dispatch(
                        forumApi.util.updateQueryData(
                            "getPosts",
                            newPost.userId,
                            (draft) => {
                                const i = draft.findIndex((p) => p.id === tempId);
                                if (i >= 0) draft[i].id = data.id;
                            }
                        )
                    );

                    dispatch(updateCreatedPostId({ tempId, newId: data.id }));
                } catch {
                    patchAll.undo();
                    patchUser.undo();
                }
            },
            // без invalidatesTags — не трогаем кэш
        }),

        deletePost: build.mutation<{ ok: boolean }, number>({
            query: (id) => ({ url: `/posts/${id}`, method: "DELETE" }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchAll = dispatch(
                    forumApi.util.updateQueryData("getPosts", undefined, (draft) => {
                        const i = draft.findIndex((p) => p.id === id);
                        if (i >= 0) draft.splice(i, 1);
                    })
                );
                dispatch(removeCreatedPost(id));
                try {
                    await queryFulfilled;
                } catch {
                    patchAll.undo();
                }
            },
        }),

        updatePost: build.mutation<Post, Pick<Post, "id" | "title" | "body">>({
            query: ({ id, ...patch }) => ({
                url: `/posts/${id}`,
                method: "PUT", // можно PATCH
                body: patch,
            }),
            async onQueryStarted(
                { id, title, body },
                { dispatch, queryFulfilled, getState }
            ) {
                // оптимистично правим деталь и списки
                const patchDetail = dispatch(
                    forumApi.util.updateQueryData("getPost", id, (draft) => {
                        draft.title = title;
                        draft.body = body;
                    })
                );
                const patchAll = dispatch(
                    forumApi.util.updateQueryData("getPosts", undefined, (draft) => {
                        const i = draft.findIndex((p) => p.id === id);
                        if (i >= 0) {
                            draft[i].title = title;
                            draft[i].body = body;
                        }
                    })
                );

                // безопасно читаем кэш getPosts(userId)
                type QueryMeta = { endpointName?: string; originalArgs?: unknown };
                type RTKQueryState = {
                    forumApi?: { queries?: Record<string, QueryMeta> };
                };
                const state = getState() as RTKQueryState;
                const cached = state.forumApi?.queries ?? {};

                const userIds = Object.values(cached).flatMap((q) =>
                    q?.endpointName === "getPosts" &&
                    typeof q.originalArgs === "number"
                        ? [q.originalArgs as number]
                        : []
                );

                const patchesUser = userIds.map((uid) =>
                    dispatch(
                        forumApi.util.updateQueryData("getPosts", uid, (draft) => {
                            const i = draft.findIndex((p) => p.id === id);
                            if (i >= 0) {
                                draft[i].title = title;
                                draft[i].body = body;
                            }
                        })
                    )
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchDetail.undo();
                    patchAll.undo();
                    patchesUser.forEach((p) => p.undo());
                }
            },
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetPostsQuery,
    useGetPostQuery,
    useGetCommentsQuery,
    useCreatePostMutation,
    useDeletePostMutation,
    useUpdatePostMutation,
} = forumApi;
