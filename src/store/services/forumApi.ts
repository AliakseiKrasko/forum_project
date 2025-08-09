import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface User { id: number; name: string; email: string; username: string }
export interface Post { id: number; userId: number; title: string; body: string; likes?: number }
export interface Comment { id: number; postId: number; name: string; email: string; body: string }

export const forumApi = createApi({
    reducerPath: "forumApi",
    baseQuery: fetchBaseQuery({ baseUrl: "https://jsonplaceholder.typicode.com" }),
    tagTypes: ["Posts", "Users", "Comments"],
    endpoints: (build) => ({
        getUsers: build.query<User[], void>({ query: () => "/users", providesTags: ["Users"] }),
        getPosts: build.query<Post[], number | void>({
            query: (userId) => userId ? `/posts?userId=${userId}` : "/posts",
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
    }),
});

export const { useGetUsersQuery, useGetPostsQuery, useGetPostQuery, useGetCommentsQuery } = forumApi;