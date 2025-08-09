"use client";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            {children}
            <Toaster richColors /> {/* можно настроить тему, позиции и т.д. */}
        </Provider>
    );
}