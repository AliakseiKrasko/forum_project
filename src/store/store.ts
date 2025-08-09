"use client";
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { forumApi } from "@/store/services/forumApi";
import uiReducer from "@/store/slices/uiSlice";
import { loadUiState, saveUiState, throttle } from "@/shared/lib/persist";

const preloadedUi = loadUiState();

export const store = configureStore({
    reducer: {
        [forumApi.reducerPath]: forumApi.reducer,
        ui: uiReducer,
    },
    middleware: (gDM) => gDM().concat(forumApi.middleware),
    preloadedState: preloadedUi ? { ui: preloadedUi } : undefined,
});

if (typeof window !== "undefined") {
    const persistThrottled = throttle(() => {
        saveUiState(store.getState().ui);
    }, 300);
    store.subscribe(persistThrottled);
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
