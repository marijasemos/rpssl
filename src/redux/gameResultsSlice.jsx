import { createSlice } from '@reduxjs/toolkit';

export const gameResultsSlice = createSlice({
    name: 'gameResults',
    initialState: {
        results: [],
        wins: 0,
        losses: 0,
        ties: 0,
    },
    reducers: {
        addGameResult: (state, action) => {
            if (state.results.length >= 10) {
                // Remove the first (oldest) item to maintain a FIFO approach
                state.results.shift();
            }
            state.results.push(action.payload);
            const { result } = action.payload;
            if (result === 'Win') state.wins += 1;
            else if (result === 'Lose') state.losses += 1;
            else if (result === 'Tie') state.ties += 1;
        },
        resetGameResults: (state) => {
            state.results = [];
            state.wins = 0;
            state.losses = 0;
            state.ties = 0;
        }
    },
});

export const { addGameResult, resetGameResults } = gameResultsSlice.actions;
export const selectGameResults = (state) => state.gameResults;
export const selectWinCount = (state) => state.gameResults.wins;
export const selectLossCount = (state) => state.gameResults.losses;
export const selectTieCount = (state) => state.gameResults.ties;

export default gameResultsSlice.reducer;
