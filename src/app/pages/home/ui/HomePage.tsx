"use client";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useGetUsersQuery } from "@/store/services/forumApi";
import { setFilterUser } from "@/store/slices/uiSlice";
import { PostList } from "@/widgets/post-list";
import {CreatePostDialog} from "@/features/create-post";

export default function HomePage() {
    const dispatch = useAppDispatch();
    const filter = useAppSelector((s) => s.ui.filterUserId);
    const { data: users } = useGetUsersQuery();

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex gap-4 items-center">
                <select
                    className="border rounded p-2"
                    value={filter ?? ""}
                    onChange={(e) => dispatch(setFilterUser(e.target.value ? Number(e.target.value) : undefined))}
                >
                    <option value="">All users</option>
                    {users?.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
            </div>
            <CreatePostDialog />
            <PostList />
        </div>
    );
}