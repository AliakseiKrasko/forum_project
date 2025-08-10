"use client";
import React from "react";
import { useAppSelector } from "@/store/store";
import {
    useGetUsersQuery,
    useUpdateUserMutation,
    useGetPostsQuery,
    useSetPostPriorityMutation,
    type User,
    type Post,
} from "@/store/services/forumApi";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Modal from "@/shared/ui/Modal";

/* -------------------------------------------------- */

export default function AdminPage() {
    const auth = useAppSelector((s) => s.ui.auth);
    // Простейшее правило: админ — userId === 1
    const isAdmin = auth.loggedIn && auth.userId === 1;

    if (!isAdmin) {
        return (
            <main className="container mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-2">403 — Forbidden</h1>
                <p className="text-neutral-600">У вас нет доступа к админке.</p>
            </main>
        );
    }

    return (
        <main className="container mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-semibold">Admin</h1>
            <UsersBlock />
            <PostsPriorityBlock />
        </main>
    );
}

/* ======================= Users ======================= */

function UsersBlock() {
    const { data: users, isLoading } = useGetUsersQuery();
    const [updateUser, { isLoading: saving }] = useUpdateUserMutation();

    const [editingUser, setEditingUser] = React.useState<User | null>(null);
    const [draft, setDraft] = React.useState<Partial<User>>({});

    const openEditor = (u: User) => {
        setEditingUser(u);
        setDraft({ name: u.name, username: u.username, email: u.email });
    };
    const closeEditor = () => {
        setEditingUser(null);
        setDraft({});
    };

    const onSave = async () => {
        if (!editingUser) return;
        await updateUser({ id: editingUser.id, ...draft });
        closeEditor();
    };

    if (isLoading) return <Section title="Users">Loading…</Section>;

    return (
        <Section title="Users">
            <div className="overflow-auto rounded-2xl border">
                <table className="min-w-[720px] w-full">
                    <thead className="bg-neutral-50 dark:bg-neutral-900">
                    <tr className="text-left">
                        <Th>ID</Th>
                        <Th>Name</Th>
                        <Th>Username</Th>
                        <Th>Email</Th>
                        <Th>Actions</Th>
                    </tr>
                    </thead>
                    <tbody>
                    {users?.map((u) => (
                        <tr key={u.id} className="border-t">
                            <Td className="font-mono">{u.id}</Td>
                            <Td>{u.name}</Td>
                            <Td>{u.username}</Td>
                            <Td>{u.email}</Td>
                            <Td>
                                <button
                                    className="rounded-lg border px-3 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                    onClick={() => openEditor(u)}
                                >
                                    Edit
                                </button>
                            </Td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <Modal open={!!editingUser} onClose={closeEditor} title="Edit user">
                <div className="grid gap-3">
                    <Labeled label="Name">
                        <input
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                            defaultValue={editingUser?.name ?? ""}
                            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                        />
                    </Labeled>
                    <Labeled label="Username">
                        <input
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                            defaultValue={editingUser?.username ?? ""}
                            onChange={(e) => setDraft((d) => ({ ...d, username: e.target.value }))}
                        />
                    </Labeled>
                    <Labeled label="Email">
                        <input
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                            defaultValue={editingUser?.email ?? ""}
                            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                        />
                    </Labeled>

                    <div className="mt-2 flex justify-end gap-2">
                        <button
                            className="rounded-lg border px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            onClick={closeEditor}
                        >
                            Cancel
                        </button>
                        <button
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
                            disabled={saving}
                            onClick={onSave}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>
        </Section>
    );
}

/* ==================== Posts priority (DnD) ==================== */

function PostsPriorityBlock() {
    const { data: posts } = useGetPostsQuery();
    const [setPriority] = useSetPostPriorityMutation();

    // локальная сортировка по приоритету (desc), затем id asc
    const [order, setOrder] = React.useState<Post[]>([]);
    React.useEffect(() => {
        if (posts) {
            const arr = [...posts].sort(
                (a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id - b.id
            );
            setOrder(arr);
        }
    }, [posts]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const ids = order.map((p) => p.id.toString());

    const handleDragEnd = async (e: DragEndEvent) => {
        const { active, over } = e;
        if (!over || active.id === over.id) return;

        const oldIndex = order.findIndex((p) => p.id.toString() === active.id);
        const newIndex = order.findIndex((p) => p.id.toString() === over.id);
        const next = arrayMove(order, oldIndex, newIndex);
        setOrder(next);

        // пересчитаем priority: верхний = max, ниже меньше
        // выберем простую формулу: priority = (N - index)
        const max = next.length;
        const updates = next.map((p, index) => ({
            id: p.id,
            priority: max - index,
        }));

        // обновим оптимистично локально: уже сделали setOrder
        // отправим патчи последовательно (чтобы не забить сеть)
        for (const u of updates) {
            // rtk-query сам сделает оптимистический апдейт в своих кэшах
            // (мы так реализовали в useSetPostPriorityMutation)
             
            await setPriority(u);
        }
    };

    return (
        <Section title="Posts priority (drag & drop)">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                    <div className="grid gap-3">
                        {order.map((p, idx) => (
                            <SortablePostItem key={p.id} post={p} rank={idx + 1} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </Section>
    );
}

function SortablePostItem({ post, rank }: { post: Post; rank: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: post.id.toString(),
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between rounded-xl border p-3 bg-white/80 dark:bg-neutral-900"
        >
            <div className="flex items-center gap-3">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab rounded-md border px-2 py-1 text-sm"
                    title="Drag"
                >
                    ⇅
                </button>
                <span className="inline-flex w-10 justify-center rounded-md bg-neutral-100 px-2 py-1 font-mono dark:bg-neutral-800">
          #{rank}
        </span>
                <div>
                    <div className="font-medium">{post.title}</div>
                    <div className="text-xs text-neutral-500">id: {post.id}</div>
                </div>
            </div>
        </div>
    );
}

/* ====================== UI bits ====================== */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="rounded-2xl border p-4 shadow-sm">{children}</div>
        </section>
    );
}
function Th({ children }: { children: React.ReactNode }) {
    return <th className="px-3 py-2 text-sm font-semibold text-neutral-600">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <td className={`px-3 py-2 text-sm ${className}`}>{children}</td>;
}
function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">{label}</span>
            {children}
        </label>
    );
}
