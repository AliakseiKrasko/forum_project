import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    addCreatedPost,
    removeCreatedPost,
    updateCreatedPostId,
} from "@/store/slices/uiSlice";

/* ===================== Types ===================== */

export interface Address { street: string; suite: string; city: string; zipcode: string }
export interface Company { name: string; catchPhrase?: string; bs?: string }
export interface User {
    id: number; name: string; email: string; username: string;
    phone?: string; website?: string; address?: Address; company?: Company;
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

/** Глубокий partial для PATCH/PUT пользователя */
export type UserPatch =
    { id: number } &
    Partial<Omit<User, "address" | "company">> & {
    address?: Partial<Address>;
    company?: Partial<Company>;
};

/* ===================== Helpers ===================== */

function mergeAddress(
    current: Address | undefined,
    patch: Partial<Address> | undefined
): Address {
    return {
        street: patch?.street ?? current?.street ?? "",
        suite: patch?.suite ?? current?.suite ?? "",
        city: patch?.city ?? current?.city ?? "",
        zipcode: patch?.zipcode ?? current?.zipcode ?? "",
    };
}

function mergeCompany(
    current: Company | undefined,
    patch: Partial<Company> | undefined
): Company {
    return {
        name: patch?.name ?? current?.name ?? "",
        catchPhrase: patch?.catchPhrase ?? current?.catchPhrase,
        bs: patch?.bs ?? current?.bs,
    };
}

/* ===================== API ===================== */

export const forumApi = createApi({
    reducerPath: "forumApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://jsonplaceholder.typicode.com",
    }),
    tagTypes: ["Posts", "Users", "Comments"],
    refetchOnFocus: false,
    refetchOnReconnect: false,

    endpoints: (build) => ({
        /* ---------- Users ---------- */
        getUsers: build.query<User[], void>({
            query: () => "/users",
            providesTags: ["Users"],
        }),

        getUser: build.query<User, number>({
            query: (id) => `/users/${id}`,
            providesTags: (r, e, id) => [{ type: "Users", id }],
        }),

        updateUser: build.mutation<User, UserPatch>({
            query: ({ id, ...patch }) => ({ url: `/users/${id}`, method: "PUT", body: patch }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const { id, ...patch } = arg;

                // детальная карточка
                const undoUser = dispatch(
                    forumApi.util.updateQueryData("getUser", id, (draft) => {
                        Object.assign(draft, patch);
                        if (patch.address) draft.address = mergeAddress(draft.address, patch.address);
                        if (patch.company) draft.company = mergeCompany(draft.company, patch.company);
                    })
                );

                // список пользователей
                const undoUsers = dispatch(
                    forumApi.util.updateQueryData("getUsers", undefined, (draft) => {
                        const i = draft.findIndex((u) => u.id === id);
                        if (i >= 0) {
                            Object.assign(draft[i], patch);
                            if (patch.address)
                                draft[i].address = mergeAddress(draft[i].address, patch.address);
                            if (patch.company)
                                draft[i].company = mergeCompany(draft[i].company, patch.company);
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    undoUser.undo();
                    undoUsers.undo();
                }
            },
        }),

        /* ---------- Posts ---------- */
        getPosts: build.query<Post[], number | void>({
            query: (userId) => (userId ? `/posts?userId=${userId}` : "/posts"),
            providesTags: ["Posts"],
        }),

        getPost: build.query<Post, number>({
            query: (id) => `/posts/${id}`,
            providesTags: (r, e, id) => [{ type: "Posts", id }],
        }),

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
                    forumApi.util.updateQueryData("getPosts", newPost.userId, (draft) => {
                        draft.unshift({ id: tempId, ...newPost });
                    })
                );

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
                const undoDetail = dispatch(
                    forumApi.util.updateQueryData("getPost", id, (draft) => {
                        draft.title = title;
                        draft.body = body;
                    })
                );
                const undoAll = dispatch(
                    forumApi.util.updateQueryData("getPosts", undefined, (draft) => {
                        const i = draft.findIndex((p) => p.id === id);
                        if (i >= 0) {
                            draft[i].title = title;
                            draft[i].body = body;
                        }
                    })
                );

                type QueryMeta = { endpointName?: string; originalArgs?: unknown };
                type RTKQueryState = {
                    forumApi?: { queries?: Record<string, QueryMeta> };
                };
                const state = getState() as RTKQueryState;
                const cached = state.forumApi?.queries ?? {};
                const userIds = Object.values(cached).flatMap((q) =>
                    q?.endpointName === "getPosts" && typeof q.originalArgs === "number"
                        ? [q.originalArgs as number]
                        : []
                );

                const undoUsers = userIds.map((uid) =>
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
                    undoDetail.undo();
                    undoAll.undo();
                    undoUsers.forEach((p) => p.undo());
                }
            },
        }),

        /* ---------- Comments ---------- */
        getComments: build.query<Comment[], number>({
            query: (postId) => `/comments?postId=${postId}`,
            providesTags: (r, e, id) => [{ type: "Comments", id }],
        }),
    }),
});

/* ===================== Hooks ===================== */

export const {
    // users
    useGetUsersQuery,
    useGetUserQuery,
    useUpdateUserMutation,
    // posts
    useGetPostsQuery,
    useGetPostQuery,
    useCreatePostMutation,
    useDeletePostMutation,
    useUpdatePostMutation,
    // comments
    useGetCommentsQuery,
} = forumApi;