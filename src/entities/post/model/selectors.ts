import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

// Фабрика селектора: на каждую карточку свой мемоизированный селектор
export const makeSelectPostUi = () =>
    createSelector(
        [
            (s: RootState, id: number) => s.ui.reactions[id] ?? 0,
            (s: RootState, id: number) => s.ui.favorites.includes(id),
            (s: RootState, id: number) => s.ui.createdPosts.some((p) => p.id === id),
            (s: RootState, id: number) => s.ui.createdComments[id]?.length ?? 0,
        ],
        (reaction, isFav, isLocal, localComments) => ({
            reaction,
            isFav,
            isLocal,
            localComments,
        })
    );
