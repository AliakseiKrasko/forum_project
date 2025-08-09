import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {Address, Company, Post, User} from "@/store/services/forumApi";

interface UiState {
    favorites: number[];
    reactions: Record<number, -1 | 0 | 1>;
    dark: boolean;
    filterUserId?: number;
    createdPosts: Post[];
    profile: (User & { avatarUrl?: string }) | null;
    auth: { loggedIn: boolean; userId: number | null };

}

export type ProfilePatch =
    Partial<Omit<User, "address" | "company">> & {
    avatarUrl?: string;
    address?: Partial<Address>;
    company?: Partial<Company>;
};

const initialState: UiState = {
    favorites: [],
    reactions: {},
    dark: false,
    createdPosts: [],
    profile: null,
    auth: { loggedIn: false, userId: null },
};



const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleDark(state){ state.dark = !state.dark; },
        setFilterUser(state, action: PayloadAction<number | undefined>){ state.filterUserId = action.payload; },
        toggleFavorite(state, action: PayloadAction<number>){
            const id = action.payload;
            state.favorites = state.favorites.includes(id)
                ? state.favorites.filter(x => x !== id)
                : [...state.favorites, id];
        },
        toggleLike(state, action: PayloadAction<number>){
            const id = action.payload;
            const cur = state.reactions[id] ?? 0;
            state.reactions[id] = cur === 1 ? 0 : 1;
        },
        toggleDislike(state, action: PayloadAction<number>){
            const id = action.payload;
            const cur = state.reactions[id] ?? 0;
            state.reactions[id] = cur === -1 ? 0 : -1;
        },
        addCreatedPost(state, action: PayloadAction<Post>) {

            state.createdPosts.unshift(action.payload);
        },
        updateCreatedPostId(state, action: PayloadAction<{ tempId: number; newId: number }>) {
            const p = state.createdPosts.find(x => x.id === action.payload.tempId);
            if (p) p.id = action.payload.newId;
        },
        removeCreatedPost(state, action: PayloadAction<number>) {
            state.createdPosts = state.createdPosts.filter(p => p.id !== action.payload);
        },
        editCreatedPost(state, action: PayloadAction<{ id: number; title: string; body: string }>) {
            const p = state.createdPosts.find(x => x.id === action.payload.id);
            if (p) {
                p.title = action.payload.title;
                p.body = action.payload.body;
            }
        },
        setProfile(state, action: PayloadAction<User>) {
            state.profile = action.payload;
        },
        patchProfile(state, action: PayloadAction<ProfilePatch>) {
            const p = action.payload;
            if (!state.profile) state.profile = {} as User & { avatarUrl?: string };

            Object.assign(state.profile, p);
            if (p.address) {
                state.profile.address = {
                    ...(state.profile.address ?? {}),
                    ...p.address,
                } as Address;
            }
            if (p.company) {
                state.profile.company = {
                    ...(state.profile.company ?? {}),
                    ...p.company,
                } as Company;
            }
            if ("avatarUrl" in p) {
                (state.profile as User & { avatarUrl?: string }).avatarUrl = p.avatarUrl;
            }
        },
        setAuth(state, action: PayloadAction<{ loggedIn: boolean; userId: number | null }>) {
            state.auth = action.payload;
        },
        logout(state) {
            state.auth = { loggedIn: false, userId: null };
            state.profile = null;
        },
    }
});

export const { toggleDark, setFilterUser, toggleFavorite, toggleLike,
    toggleDislike, addCreatedPost, updateCreatedPostId, removeCreatedPost,
    editCreatedPost, setProfile, patchProfile, setAuth, logout } = uiSlice.actions;
export default uiSlice.reducer;
export type { UiState };