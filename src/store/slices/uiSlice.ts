import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
    favorites: number[];
    dark: boolean;
    filterUserId?: number;
}
const initialState: UiState = { favorites: [], dark: false };

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
        }
    }
});
export const { toggleDark, setFilterUser, toggleFavorite } = uiSlice.actions;
export default uiSlice.reducer;