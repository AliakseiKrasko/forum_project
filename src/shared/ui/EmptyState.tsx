"use client";
import React from "react";

type Props = {
    title?: string;
    message?: string;
    actionText?: string;
    onAction?: () => void;
};

export default function EmptyState({
                                       title = "Nothing here yet",
                                       message = "No items to show.",
                                       actionText,
                                       onAction,
                                   }: Props) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border p-8 text-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="max-w-md text-sm text-neutral-500">{message}</p>
            {actionText && onAction && (
                <button
                    onClick={onAction}
                    className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    {actionText}
                </button>
            )}
        </div>
    );
}
