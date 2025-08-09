"use client";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useEffect } from "react";

function ThemeBoot() {
    useEffect(() => {
        const s = store.getState();
        const dark = s.ui.dark;
        const root = document.documentElement;
        dark ? root.classList.add("dark") : root.classList.remove("dark");
    }, []);
    return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <ThemeBoot />
            {children}
        </Provider>
    );
}