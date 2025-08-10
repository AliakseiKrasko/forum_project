"use client";
import React from "react";
import { createPortal } from "react-dom";

type Props = {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: Props) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    if (!mounted || !open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl rounded-2xl border bg-white p-4 shadow-lg dark:bg-neutral-900"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button
                        aria-label="Close"
                        className="rounded-md border px-2 py-1 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
}
