"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateCommentMutation } from "@/store/services/forumApi";
import { toast } from "sonner";

const Schema = z.object({
    name: z.string().min(2, "Минимум 2 символа"),
    email: z.string().email("Некорректный e-mail"),
    body: z.string().min(3, "Минимум 3 символа"),
});
type FormValues = z.infer<typeof Schema>;

export default function AddComment({ postId }: { postId: number }) {
    const [createComment, { isLoading }] = useCreateCommentMutation();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(Schema),
        defaultValues: { name: "", email: "", body: "" },
    });

    const onSubmit = async (v: FormValues) => {
        try {
            await createComment({ postId, ...v }).unwrap();
            toast.success("Комментарий добавлен");
            reset();
        } catch {
            toast.error("Не удалось добавить комментарий");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 rounded-xl border p-3">
            <h3 className="font-semibold">Add a comment</h3>
            <input {...register("name")} placeholder="Name" className="w-full rounded border px-3 py-2" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}

            <input {...register("email")} placeholder="Email" className="w-full rounded border px-3 py-2" />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}

            <textarea {...register("body")} placeholder="Text…" className="h-24 w-full rounded border px-3 py-2" />
            {errors.body && <p className="text-sm text-red-500">{errors.body.message}</p>}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
                >
                    {isLoading ? "Sending…" : "Send"}
                </button>
            </div>
        </form>
    );
}
