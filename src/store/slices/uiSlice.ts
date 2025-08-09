import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
    favorites: number[];
    reactions: Record<number, -1 | 0 | 1>;
    dark: boolean;
    filterUserId?: number;

}
const initialState: UiState = { favorites: [], reactions: {}, dark: false };

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
        }
    }
});

export const { toggleDark, setFilterUser, toggleFavorite, toggleLike, toggleDislike } = uiSlice.actions;
export default uiSlice.reducer;
export type { UiState };