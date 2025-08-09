"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreatePostMutation } from "@/store/services/forumApi";
import { useAppSelector } from "@/store/store";
import { toast } from "sonner";

const Schema = z.object({
    title: z.string().min(3, "Minimum 3 characters"),
    body: z.string().min(5, "Minimum 5 characters"),
    userId: z.number().int().positive(),
});
type FormValues = z.infer<typeof Schema>;

export default function CreatePostDialog() {
    const currentUserId = useAppSelector(s => s.ui.filterUserId) || 1; // по умолчанию 1 (можно изменить)
    const [createPost, { isLoading }] = useCreatePostMutation();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(Schema),
        defaultValues: { title: "", body: "", userId: currentUserId },
    });

    const onSubmit = async (v: FormValues) => {
        try {
            await createPost(v).unwrap();
            toast.success("Post created");
            reset({ title: "", body: "", userId: currentUserId });
        } catch {
            toast.error("Unable to create post");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border bg-white/80 p-4 shadow-sm dark:bg-neutral-900">
            <h2 className="mb-3 text-base font-semibold">Create a post</h2>

            <label className="block text-sm text-neutral-600 dark:text-neutral-300">Title</label>
            <input {...register("title")} placeholder="Post title"
                   className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500" />

            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}

            <label className="mt-3 block text-sm text-neutral-600 dark:text-neutral-300">Post text</label>
            <textarea {...register("body")} placeholder="Write something…"
                      className="mt-1 h-28 w-full resize-y rounded-lg border px-3 py-2 outline-none focus:border-blue-500" />
            {errors.body && <p className="mt-1 text-sm text-red-500">{errors.body.message}</p>}

            <div className="mt-3 flex justify-end">
                <button type="submit" disabled={isLoading}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-60">
                    {isLoading ? "Creating…" : "Create"}
                </button>
            </div>
        </form>
    );
}
