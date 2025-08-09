import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {Post} from "@/store/services/forumApi";

interface UiState {
    favorites: number[];
    reactions: Record<number, -1 | 0 | 1>;
    dark: boolean;
    filterUserId?: number;
    createdPosts: Post[];

}
const initialState: UiState = {
    favorites: [],
    reactions: {},
    dark: false,
    createdPosts: [],
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
    }
});

export const { toggleDark, setFilterUser, toggleFavorite, toggleLike, toggleDislike, addCreatedPost, updateCreatedPostId, removeCreatedPost } = uiSlice.actions;
export default uiSlice.reducer;
export type { UiState };