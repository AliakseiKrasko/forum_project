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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 border rounded p-4">
            <h2 className="font-semibold">Create a post</h2>
            <div className="flex gap-2">
                <input {...register("title")} placeholder="Title" className="border rounded p-2 flex-1" />
            </div>
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}

            <textarea {...register("body")} placeholder="Post text" className="border rounded p-2 w-full h-28" />
            {errors.body && <p className="text-red-500 text-sm">{errors.body.message}</p>}

            {/* скрытое/readonly поле userId — можно сделать select пользователя */}
            <input type="hidden" {...register("userId", { valueAsNumber: true })} />

            <div className="flex gap-2">
                <button type="submit" className="border rounded px-3 py-2" disabled={isLoading}>
                    {isLoading ? "We create…" : "Create"}
                </button>
            </div>
        </form>
    );
}
