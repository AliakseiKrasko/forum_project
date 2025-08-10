"use client";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useGetUsersQuery } from "@/store/services/forumApi";
import { setFilterUser } from "@/store/slices/uiSlice";
import { PostList } from "@/widgets/post-list";
import {CreatePostDialog} from "@/features/create-post";

export default function HomePage() {

    return (
        <main className="container mx-auto p-6 space-y-6">
                <div className="flex gap-4 items-center">
                </div>
                <CreatePostDialog />
                <PostList />
        </main>

    );
}