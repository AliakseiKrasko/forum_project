"use client";
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { forumApi } from "@/store/services/forumApi";
import uiReducer, { UiState } from "@/store/slices/uiSlice";

const PERSIST_KEY = "forum_ui";

function loadState(): UiState | undefined {
    try {
        if (typeof window === "undefined") return undefined;
        const raw = localStorage.getItem(PERSIST_KEY);
        return raw ? (JSON.parse(raw) as UiState) : undefined;
    } catch {
        return undefined;
    }
}

const preloadedUi = loadState();

export const store = configureStore({
    reducer: {
        [forumApi.reducerPath]: forumApi.reducer,
        ui: uiReducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(forumApi.middleware),
    preloadedState: preloadedUi ? { ui: preloadedUi } : undefined,
});

// persist ui slice
if (typeof window !== "undefined") {
    store.subscribe(() => {
        const s = store.getState().ui;
        localStorage.setItem(PERSIST_KEY, JSON.stringify(s));
    });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;