"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
    useGetUserQuery,
    useUpdateUserMutation,
    type User,
    type UserPatch,
} from "@/store/services/forumApi";
import {
    patchProfile,
    type ProfilePatch,
    setProfile,
} from "@/store/slices/uiSlice";
import { toast } from "sonner";

/* ---------------- Schema  ---------------- */

const OptionalString = z
    .union([z.string(), z.literal("")])
    .transform((v) => (v === "" ? undefined : v))
    .optional();

const OptionalUrl = z
    .union([z.string().url("Некорректный URL"), z.literal("")])
    .transform((v) => (v === "" ? undefined : v))
    .optional();

const Schema = z.object({
    name: z.string().min(2, "Минимум 2 символа"),
    email: z.string().email("Некорректный e-mail"),
    username: z.string().min(2, "Минимум 2 символа"),
    phone: OptionalString,
    website: OptionalUrl,
    avatarUrl: OptionalUrl,
    address: z
        .object({
            street: OptionalString,
            suite: OptionalString,
            city: OptionalString,
            zipcode: OptionalString,
        })
        .optional(),
    company: z.object({ name: OptionalString }).optional(),
});
type FormValues = z.infer<typeof Schema>;

/* ---------------- Page ---------------- */

const CURRENT_USER_ID = 1;

export default function ProfilePage() {
    const dispatch = useAppDispatch();
    const localProfile = useAppSelector((s) => s.ui.profile);
    const { data: serverUser } = useGetUserQuery(CURRENT_USER_ID, {
        skip: !!localProfile,
    });

    // локальный профиль имеет приоритет (persist), если его нет — берём с сервера
    const user: (User & { avatarUrl?: string }) | undefined =
        localProfile ?? (serverUser as User | undefined);

    const [updateUser, { isLoading }] = useUpdateUserMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<FormValues>({
        resolver: zodResolver(Schema),
        defaultValues: {
            name: "",
            email: "",
            username: "",
            phone: "",
            website: "",
            avatarUrl: "",
            address: { street: "", suite: "", city: "", zipcode: "" },
            company: { name: "" },
        },
    });

    // заносим серверного юзера в локальный стейт, чтобы переживать перезагрузку
    React.useEffect(() => {
        if (serverUser && !localProfile) {
            dispatch(setProfile(serverUser));
        }
    }, [serverUser, localProfile, dispatch]);

    // когда есть пользователь — заполняем форму актуальными значениями
    React.useEffect(() => {
        if (user) {
            reset({
                name: user.name ?? "",
                email: user.email ?? "",
                username: user.username ?? "",
                phone: user.phone ?? "",
                website: user.website ?? "",
                avatarUrl: user.avatarUrl ?? "",
                address: {
                    street: user.address?.street ?? "",
                    suite: user.address?.suite ?? "",
                    city: user.address?.city ?? "",
                    zipcode: user.address?.zipcode ?? "",
                },
                company: { name: user.company?.name ?? "" },
            });
        }
    }, [user, reset]);

    const onSubmit = async (v: FormValues) => {
        try {
            // оптимистически патчим локально (ui.profile) — это сохранится в localStorage
            dispatch(patchProfile(v as ProfilePatch));
            // API вызов (MSW вернёт 200; с реальным API тоже ок)
            await updateUser({ id: CURRENT_USER_ID, ...(v as Omit<UserPatch, "id">) }).unwrap();
            toast.success("Profile saved");
        } catch {
            toast.error("Unable to save profile");
        }
    };

    if (!user) {
        return <main className="container mx-auto p-6">Loading…</main>;
    }

    const avatarSrc =
        watch("avatarUrl") ||
        user.avatarUrl ||
        `https://i.pravatar.cc/96?u=${encodeURIComponent(
            user.email ?? String(user.id)
        )}`;

    return (
        <main className="container mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-semibold">Profile</h1>

            <div className="flex items-center gap-3">
                <img
                    src={avatarSrc}
                    alt="avatar"
                    className="size-16 rounded-full object-cover"
                />
                <div className="text-sm text-neutral-500">ID: {CURRENT_USER_ID}</div>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-4 rounded-2xl border bg-white/80 p-4 shadow-sm dark:bg-neutral-900 md:grid-cols-2"
            >
                <Field label="Name" error={errors.name?.message}>
                    <input
                        {...register("name")}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                    />
                </Field>

                <Field label="Email" error={errors.email?.message}>
                    <input
                        {...register("email")}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                    />
                </Field>

                <Field label="Username" error={errors.username?.message}>
                    <input
                        {...register("username")}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                    />
                </Field>

                <Field label="Phone">
                    <input
                        {...register("phone")}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                    />
                </Field>

                <Field label="Website" error={errors.website?.message}>
                    <input
                        {...register("website")}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                        placeholder="https://example.com"
                    />
                </Field>

                <Field label="Avatar URL" error={errors.avatarUrl?.message}>
                    <input
                        {...register("avatarUrl")}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                        placeholder="https://…"
                    />
                </Field>

                <div className="md:col-span-2">
                    <h2 className="mb-2 font-semibold">Address</h2>
                    <div className="grid gap-3 md:grid-cols-4">
                        <input
                            {...register("address.street")}
                            placeholder="Street"
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                        />
                        <input
                            {...register("address.suite")}
                            placeholder="Suite"
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                        />
                        <input
                            {...register("address.city")}
                            placeholder="City"
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                        />
                        <input
                            {...register("address.zipcode")}
                            placeholder="Zipcode"
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <h2 className="mb-2 font-semibold">Company</h2>
                    <input
                        {...register("company.name")}
                        placeholder="Company name"
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                    />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="rounded-lg border px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {isLoading ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </form>
        </main>
    );
}

/* ---------------- UI helpers ---------------- */

function Field({
                   label,
                   error,
                   children,
               }: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="flex flex-col gap-1">
      <span className="text-sm text-neutral-600 dark:text-neutral-300">
        {label}
      </span>
            {children}
            {error && <span className="text-sm text-red-500">{error}</span>}
        </label>
    );
}

