"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Post } from "@/store/services/forumApi";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { editCreatedPost } from "@/store/slices/uiSlice";
import { useUpdatePostMutation } from "@/store/services/forumApi";
import { toast } from "sonner";

const Schema = z.object({
    title: z.string().min(3, "Minimum 3 characters"),
    body: z.string().min(5, "Minimum 5 characters"),
});
type FormValues = z.infer<typeof Schema>;

export default function EditPostDialog({ post }: { post: Post }) {
    const dispatch = useAppDispatch();
    const isLocal = useAppSelector(s => s.ui.createdPosts.some(p => p.id === post.id));
    const [updatePost, { isLoading }] = useUpdatePostMutation();
    const [open, setOpen] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(Schema),
        defaultValues: { title: post.title, body: post.body },
    });

    const onSubmit = async (v: FormValues) => {
        try {
            if (isLocal) {
                dispatch(editCreatedPost({ id: post.id, ...v }));
                toast.success("Post updated");
            } else {
                await updatePost({ id: post.id, ...v }).unwrap();
                toast.success("Post updated");
            }
            setOpen(false);
        } catch {
            toast.error("Unable to update post");
        }
    };

    return (
        <>
            <button className="rounded border px-2 py-1 cursor-pointer" onClick={() => { reset({ title: post.title, body: post.body }); setOpen(true); }}>
                Edit
            </button>

            {open && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 w-full max-w-lg">
                        <h2 className="font-semibold mb-2">Edit post</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                            <input {...register("title")} className="border rounded p-2 w-full" />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                            <textarea {...register("body")} className="border rounded p-2 w-full h-32" />
                            {errors.body && <p className="text-red-500 text-sm">{errors.body.message}</p>}
                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" className="border rounded px-3 py-2 cursor-pointer" onClick={() => setOpen(false)}>Cancellation</button>
                                <button type="submit" className="border rounded px-3 py-2 cursor-pointer" disabled={isLoading}>
                                    {isLoading ? "I'm saving it…" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
