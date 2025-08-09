import type { UiState } from "@/store/slices/uiSlice";

export const PERSIST_KEY = "forum_ui";
const VERSION = 1;

type Persisted<T> = { __v: number; data: T };

export function ensureUiDefaults(ui?: Partial<UiState>): UiState {
    return {
        favorites: ui?.favorites ?? [],
        reactions: ui?.reactions ?? {},
        dark: ui?.dark ?? false,
        filterUserId: ui?.filterUserId,
        createdPosts: ui?.createdPosts ?? [],
    };
}

export function loadUiState(): UiState | undefined {
    if (typeof window === "undefined") return undefined;
    try {
        const raw = localStorage.getItem(PERSIST_KEY);
        if (!raw) return undefined;
        const parsed = JSON.parse(raw) as Persisted<Partial<UiState>> | Partial<UiState>;
        if ((parsed as Persisted<Partial<UiState>>).__v != null) {
            const { data } = parsed as Persisted<Partial<UiState>>;
            return ensureUiDefaults(data);
        }
        return ensureUiDefaults(parsed as Partial<UiState>);
    } catch {
        return undefined;
    }
}

export function saveUiState(state: UiState) {
    if (typeof window === "undefined") return;
    try {
        const payload: Persisted<UiState> = { __v: VERSION, data: state };
        localStorage.setItem(PERSIST_KEY, JSON.stringify(payload));
    } catch {}
}

export function throttle<T extends (...args: unknown[]) => void>(
    fn: T,
    ms: number
) {
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
