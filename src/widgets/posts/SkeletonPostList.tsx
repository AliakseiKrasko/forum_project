"use client";
import React from "react";
import SkeletonPostCard from "./SkeletonPostCard";

export default function SkeletonPostList({ count = 6 }: { count?: number }) {
    return (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonPostCard key={i} />
            ))}
        </ul>
    );
}
