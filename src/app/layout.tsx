import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import Providers from "@/app/providers";
import {Header} from "@/widgets/headers";


export const metadata: Metadata = { title: "Forum", description: "Test Forum" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru" suppressHydrationWarning>
        <body className="min-h-screen bg-background text-foreground">
        <Providers>
            <Header />
            <main>{children}</main>
        </Providers>
        </body>
        </html>
    );
}
