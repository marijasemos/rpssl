import { createSlice } from '@reduxjs/toolkit';

const gameResultsSlice = createSlice({
    name: 'gameResults',
    initialState: [],
    reducers: {
        addGameResult: (state, action) => {
           // state.push(action.payload);
           // Check if we already have 10 results
           if (state.length >= 10) {
            // Remove the first (oldest) item to maintain a FIFO approach
            state.shift();
        }
        // Add the new game result to the end
        state.push(action.payload);
        },
        resetGameResults: () => {
            // Return an empty array to clear all game results
            return [];
        }
    }
});

export const { addGameResult, resetGameResults } = gameResultsSlice.actions;

export default gameResultsSlice.reducer;
