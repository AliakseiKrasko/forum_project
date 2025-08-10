import { initialUiState, type UiState } from "@/store/slices/uiSlice";

export const PERSIST_KEY = "forum_ui";
const VERSION = 1;

type Persisted<T> = { __v: number; data: T };

// type guard для формата { __v, data }
function isPersisted<T>(v: unknown): v is Persisted<T> {
    return typeof (v as { __v?: unknown })?.__v === "number";
}

/** Подмешиваем недостающие поля к сохранённому стейту */
export function ensureUiDefaults(ui?: Partial<UiState>): UiState {
    return {
        favorites: ui?.favorites ?? initialUiState.favorites,
        reactions: ui?.reactions ?? initialUiState.reactions,
        dark: ui?.dark ?? initialUiState.dark,
        filterUserId: ui?.filterUserId ?? initialUiState.filterUserId,
        createdPosts: ui?.createdPosts ?? initialUiState.createdPosts,
        profile: ui?.profile ?? initialUiState.profile,
        auth: ui?.auth ?? initialUiState.auth,
        createdComments: ui?.createdComments ?? initialUiState.createdComments, // ✅ было 'loaded' — исправлено
    };
}

export function loadUiState(): UiState | undefined {
    if (typeof window === "undefined") return undefined;
    try {
        const raw = localStorage.getItem(PERSIST_KEY);
        if (!raw) return undefined;

        const parsed: unknown = JSON.parse(raw);

        // новый формат — { __v, data }
        if (isPersisted<Partial<UiState>>(parsed)) {
            return ensureUiDefaults(parsed.data);
        }

        // старый формат — просто объект ui
        if (typeof parsed === "object" && parsed !== null) {
            return ensureUiDefaults(parsed as Partial<UiState>);
        }

        return undefined;
    } catch {
        return undefined;
    }
}

export function saveUiState(state: UiState) {
    if (typeof window === "undefined") return;
    try {
        const payload: Persisted<UiState> = { __v: VERSION, data: state };
        localStorage.setItem(PERSIST_KEY, JSON.stringify(payload));
    } catch {
        // игнорируем квоту/приватный режим и т.п.
    }
}

/** Простой throttle, чтобы не писать в storage слишком часто */
export function throttle<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
    let last = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        const now = Date.now();
        const remain = ms - (now - last);

        if (remain <= 0) {
            last = now;
            fn(...args);
        } else {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                last = Date.now();
                fn(...args);
            }, remain);
        }
    };
}
