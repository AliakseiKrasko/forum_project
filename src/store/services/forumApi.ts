import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {addCreatedPost, removeCreatedPost, updateCreatedPostId} from "@/store/slices/uiSlice";

export interface User { id: number; name: string; email: string; username: string }
export interface Post { id: number; userId: number; title: string; body: string; likes?: number }
export interface Comment { id: number; postId: number; name: string; email: string; body: string }

export const forumApi = createApi({
    reducerPath: "forumApi",
    baseQuery: fetchBaseQuery({ baseUrl: "https://jsonplaceholder.typicode.com" }),
    tagTypes: ["Posts", "Users", "Comments"],
    // отключим лишние авто-рефетчи на фоне
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

                // оптимистично добавляем в кеш "все посты"
                const patchAll = dispatch(
                    forumApi.util.updateQueryData("getPosts", undefined, (draft) => {
                        draft.unshift({ id: tempId, ...newPost });
                    })
                );
                // и кеш "посты пользователя"
                const patchUser = dispatch(
                    forumApi.util.updateQueryData("getPosts", newPost.userId, (draft) => {
                        draft.unshift({ id: tempId, ...newPost });
                    })
                );
                dispatch(addCreatedPost({ id: tempId, ...newPost }));

                try {
                    const { data } = await queryFulfilled;
                    // заменяем временный id на реальный
                    dispatch(
                        forumApi.util.updateQueryData("getPosts", undefined, (draft) => {
                            const i = draft.findIndex((p) => p.id === tempId);
                            if (i >= 0) draft[i].id = data.id;
                        })
                    );
                    dispatch(
                        forumApi.util.updateQueryData("getPosts", newPost.userId, (draft) => {
                            const i = draft.findIndex((p) => p.id === tempId);
                            if (i >= 0) draft[i].id = data.id;
                        })
                    );
                    dispatch(updateCreatedPostId({ tempId, newId: data.id }));
                } catch {
                    patchAll.undo();
                    patchUser.undo();
                }
            },
            // ВАЖНО: без invalidatesTags -> не будет рефетча, который стирает оптимистичный пост
            // invalidatesTags: ["Posts"],
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
            // invalidatesTags: ["Posts"],
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
} = forumApi;
