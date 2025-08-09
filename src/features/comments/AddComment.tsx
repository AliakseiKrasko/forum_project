"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const Schema = z.object({ email: z.string().email(), body: z.string().min(3) });
export type AddCommentInput = z.infer<typeof Schema>;

export default function AddComment({ onAdd }: { onAdd: (v: AddCommentInput)=>void }){
    const { register, handleSubmit, formState: { errors }, reset } = useForm<AddCommentInput>({ resolver: zodResolver(Schema) });
    return (
        <form onSubmit={handleSubmit(v => { onAdd(v); reset(); })} className="space-y-2">
            <input {...register("email")} placeholder="email" className="border p-2 rounded w-full"/>
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            <textarea {...register("body")} placeholder="Комментарий" className="border p-2 rounded w-full"/>
            {errors.body && <p className="text-red-500 text-sm">{errors.body.message}</p>}
            <button className="border px-3 py-2 rounded">Add</button>
        </form>
    );
}