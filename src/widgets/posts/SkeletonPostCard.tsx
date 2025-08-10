"use client";
import React from "react";
import { Skeleton } from "@/shared/ui/Skeleton";

export default function SkeletonPostCard() {
    return (
        <li className="h-full overflow-hidden rounded-2xl border bg-white/80 p-4 shadow-sm dark:bg-neutral-900">
            <div className="grid h-full grid-cols-[1fr,128px] gap-4">
                <div className="min-w-0 flex flex-col">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="mb-2 h-4 w-40" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                    </div>

                    <Skeleton className="mt-4 h-6 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-full" />
                    <Skeleton className="mt-1 h-4 w-5/6" />
                    <Skeleton className="mt-1 h-4 w-2/3" />

                    <div className="mt-auto flex items-center gap-2 pt-4">
                        <Skeleton className="h-8 w-16 rounded-full" />
                        <Skeleton className="h-8 w-16 rounded-full" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <div className="ml-auto flex items-center gap-2">
                            <Skeleton className="h-8 w-12 rounded-md" />
                            <Skeleton className="h-8 w-14 rounded-md" />
                            <Skeleton className="h-8 w-14 rounded-md" />
                        </div>
                    </div>
                </div>

                <Skeleton className="h-[120px] w-[128px] rounded-xl" />
            </div>
        </li>
    );
}
