"use client";


import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { forumApi } from "@/store/services/forumApi";
import uiReducer from "@/store/slices/uiSlice";

export const store = configureStore({
    reducer: {
        [forumApi.reducerPath]: forumApi.reducer,
        ui: uiReducer,
    },
    middleware: (getDefault) => getDefault().concat(forumApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;