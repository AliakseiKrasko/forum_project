"use client";
import React from "react";

type Props = {
    title?: string;
    message?: string;
    onRetry?: () => void;
};

export default function ErrorState({
                                       title = "Something went wrong",
                                       message = "Please try again.",
                                       onRetry,
                                   }: Props) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border p-8 text-center">
            <h3 className="text-lg font-semibold text-red-600">{title}</h3>
            <p className="max-w-md text-sm text-neutral-500">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-2 rounded-lg border px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                    Retry
                </button>
            )}
        </div>
    );
}
