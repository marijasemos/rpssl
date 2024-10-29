import React from 'react';
import { useSelector } from 'react-redux';
import './GameResultsTable.css';
import { addGameResult, resetGameResults, selectWinCount, selectLossCount, selectTieCount } from '../../redux/gameResultsSlice';

const GameResultsTable = () => {
    const gameResults = useSelector((state) => state.gameResults.results);

    const winCount = useSelector(selectWinCount);
    const lossCount = useSelector(selectLossCount);
    const tieCount = useSelector(selectTieCount);
    return (
        <div>
            <h2>Your Game Results</h2>
            <div className="game-results-summary">
                <p className="win">Win: {winCount}</p>
                <p className="lose">Lose: {lossCount}</p>
                <p className="tie">Tie: {tieCount}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Your Choice</th>
                        <th>Opponent Choice</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {gameResults.map((result, index) => (
                        <tr key={index}>
                            <td>{result.playerOneChoice}</td>
                            <td>{result.playerTwoChoice}</td>
                            <td>{result.result}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GameResultsTable;
