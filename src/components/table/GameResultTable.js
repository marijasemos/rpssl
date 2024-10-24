import React from 'react';
import { useSelector } from 'react-redux';
import './GameResultsTable.css';

const GameResultsTable = () => {
    const gameResults = useSelector((state) => state.gameResults);

    // Log the game results to help with debugging
    console.log("Current game results:", gameResults);

    return (
        <div>
            <h2>Your Game Results</h2>
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
