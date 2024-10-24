import { configureStore } from '@reduxjs/toolkit';
import gameResultsReducer from './redux/gameResultsSlice';

const store = configureStore({
    reducer: {
        gameResults: gameResultsReducer
    }
});

export default store;
