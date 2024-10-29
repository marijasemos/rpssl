import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import useHttp from '../../hooks/useHttp';
import useSignalR from '../../hooks/useSignalR';
import CreateGameModal from '../../components/modals/CreateGameModal';
import JoinGameModal from '../../components/modals/JoinGameModal';
import ItemCard from '../../components/ItemCard/itemCard';
import GameResultsTable from '../../components/table/GameResultTable';
import { addGameResult, resetGameResults } from '../../redux/gameResultsSlice';
import CustomAlert from '../../components/alerts/CustomAlert';

import './Home.css';

const playGameConfig = { method: 'POST', headers: { 'Content-Type': 'application/json' } };

const HomePage = () => {
    const [gameCode, setGameCode] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [secondPlayerChoice, setSecondPlayerChoice] = useState(null);
    const [selectedChoice, setSelectedChoice] = useState();
    const [bothConnected, setBothConnected] = useState(false);
    const [message, setMessage] = useState('');
    const [gameOverMessage, setGameOverMessage] = useState('');

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setJoinModalOpen] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [isWaitingForPlayer, setIsWaitingForPlayer] = useState(false);
    const [animatingItem, setAnimatingItem] = useState(null);
    const [isRotating, setIsRotating] = useState(false);
    const [statusGame, setStatusGame] = useState(null);
    const { data, isLoading, error } = useHttp('http://choice.localhost/api/choices', { method: 'GET' }, []);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [countdown, setCountdown] = useState(20);
    const timerRef = useRef(null);

    const { data: playResponse, sendRequest: sendPlayRequest, setData } = useHttp();
    const dispatch = useDispatch();
    const signalRHandlers = {
        Waiting: (msg) => {
            setMessage(msg);
            setIsWaitingForPlayer(true);
        },
        Connected: (isConnected) => {
            if (isConnected) {
                setBothConnected(true);
                setMessage('Both players are connected, lets play!');
            }
        },
        PlayerId: (id) => {
            setPlayerId(id);
        },
        Result: (resultData) => handleGameResult(resultData),
        PlayerJoined: (playerTwoId) => {
            setMessage(`Player ${playerTwoId} has joined the game!`);
            setIsWaitingForPlayer(false);
        },
        ReceiveMove: (playerId, choice) => setMessage(`Player ${playerId} played ${choice}.`),
        GameOver: (message) => setGameOverMessage(message)
    };

    const { connection, isConnected, startConnection, stopConnection } = useSignalR(signalRHandlers);

    useEffect(() => {
        if (statusGame) {
            document.body.classList.add(`blink-${statusGame.toLowerCase()}`);
            const timeoutId = setTimeout(() => {
                document.body.classList.remove(`blink-${statusGame.toLowerCase()}`);
                setStatusGame(null);
            }, 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [statusGame]);

    const handleCloseAlert = () => {
        setIsAlertOpen(false);
        setGameOverMessage('');
        if (isConnected) stopConnection();
    };

    useEffect(() => {
        if (gameOverMessage) {
            setIsAlertOpen(true);
        }
        setBothConnected(false);
        setSelectedChoice(null);
        setSecondPlayerChoice(null);
        setMessage('');
        setJoinModalOpen(false);
        setCreateModalOpen(false);
        setSelectedIcon(null);
        setAnimatingItem(null);
        setSelectedChoice(null)
        setData(null)
        handleReset();
    }, [gameOverMessage]);

    const handleReset = () => {
        dispatch(resetGameResults());
    };

    const createGame = async () => {
        try {
            const response = await fetch('http://game.localhost/api/play/create', playGameConfig);
            if (response.ok) {
                const data = await response.json();
                setGameCode(data.gameCode);
                setPlayerId(data.playerId);
                setMessage(`Game created! Code: ${data.gameCode}`);
                startConnection(`http://game.localhost/GameHub?gameCode=${data.gameCode}`);
                setCreateModalOpen(true);
                handleReset();
            } else {
                setMessage('Failed to create game. Please try again.');
            }
        } catch (error) {
            console.error('Error creating game:', error);
            setMessage('Failed to create game. Please try again.');
        }
    };

    const initiateJoinGame = () => {
        if (!connection) startConnection(`http://game.localhost/GameHub?gameCode=`);
    };

    const joinGame = (enteredGameCode) => {
        if (isConnected && connection) {
            connection.invoke('JoinGame', enteredGameCode)
                .then(() => setMessage(`Joining game: ${enteredGameCode}`))
                .catch(err => {
                    setMessage('Failed to join the game. Please try again.');
                    console.error(err);
                });
            handleReset();
        }
    };

    const handleCancelGame = (isTimeExpired = false) => {
        if (isConnected && connection) {
            connection.invoke('GameOver', gameCode, isTimeExpired)
                .catch(err => {
                    console.error('Error sending game over notification via WebSocket:', err);
                    setGameOverMessage('Unable to cancel the game at the moment. Please check your internet connection and try again.');
                });
        }
    };

    const handleCardClick = (item) => {
        setSecondPlayerChoice(null);
        setSelectedIcon(item.name);
        setIsRotating(true);
        setAnimatingItem(item);
        setCountdown(20);
        setIsCountingDown(true);
        if (timerRef.current) clearInterval(timerRef.current);
        
        timerRef.current = setInterval(() => {
            setCountdown((prevCount) => {
                if (prevCount === 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    setIsCountingDown(false);
                    handleCancelGame(true);
                }
                return prevCount - 1;
            });
        }, 1000);

        setTimeout(() => setIsRotating(false), 500);

        if (isConnected && connection) {
            connection.invoke('SendMove', gameCode, playerId, item.id)
                .catch(err => {
                    console.error('Error sending move via WebSocket:', err);
                    setMessage('Failed to send move via WebSocket. Please try again.');
                });
            setSelectedChoice(item.id);
        } else {
            sendPlayRequest('http://game.localhost/api/play', {
                ...playGameConfig,
                body: JSON.stringify({ playerChoice: item.id }),
            }).catch(err => {
                console.error('Error sending move via HTTP:', err);
                setMessage('Failed to send move. Please try again.');
            });
        }
    };

    useEffect(() => {
        if (secondPlayerChoice) {
            setIsCountingDown(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [secondPlayerChoice]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleGameResult = (resultData) => {
        if ((resultData || playResponse) && data) {
            try {
                let playerTwoChoice = "";
                let playerOneChoice = "";
                let result = "";

                if (playResponse && data) {
                    playerTwoChoice = data.find(x => x.id === playResponse.computer)?.name;
                    playerOneChoice = data.find(x => x.id === playResponse.player)?.name;
                    result = playResponse.results;
                } else if (resultData && data) {
                    playerTwoChoice = data.find(x => x.id === resultData.opponentChoice)?.name;
                    playerOneChoice = data.find(x => x.id === resultData.choice)?.name;
                    result = resultData.status;
                    setSecondPlayerChoice(data.find(x => x.id === resultData.opponentChoice));
                }

                const newGameResult = {
                    playerOneId: playerId,
                    playerTwoId: 'computer',
                    playerOneChoice,
                    playerTwoChoice,
                    result
                };

                dispatch(addGameResult(newGameResult));
                setStatusGame(result);
                setTimeout(() => setAnimatingItem(null), 3000);
            } catch (error) {
                console.log(error);
            }
        } else {
            console.warn("Missing resultData, data, or playResponse:", resultData, data, playResponse);
        }
    };

    useEffect(() => {
        if (playResponse) {
            handleGameResult(playResponse);
            setSecondPlayerChoice(data.find(x => x.id === playResponse.computer));
        }
    }, [playResponse]);

    if (isLoading) {
        return <p>Fetching data ...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }
 const handleJoinClick  = () => {
    setJoinModalOpen(true);
    initiateJoinGame();
 }
    return (
        <div className="home-page">
            <div className="header">
                {!bothConnected ? (
                    <>
                        <button onClick={statusGame == null ? createGame : undefined}>Create Game</button>
                        <button onClick={statusGame == null ? () => handleJoinClick() : undefined}>Join Game</button>
                    </>
                ) : (
                    <button onClick={() => handleCancelGame()}>Game end</button>
                )}
            </div>

            <div className="choose">
                {data && data.map(item => (
                    <ItemCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        onClick={() => handleCardClick(item)}
                        statusGame={statusGame}
                    />
                ))}
            </div>

            <CreateGameModal
                isOpen={isCreateModalOpen}
                onRequestPlay={() => setCreateModalOpen(false)}
                onRequestClose={() => handleCancelGame()}
                gameCode={gameCode}
                playerId={playerId}
                message={message}
                bothConnected={bothConnected}
            />

            <JoinGameModal
                isOpen={isJoinModalOpen}
                onRequestPlay={() => setJoinModalOpen(false)}
                onRequestClose={() => handleCancelGame()}
                gameCode={gameCode}
                setGameCode={setGameCode}
                onJoin={joinGame}
                onConnect={initiateJoinGame}
                bothConnected={bothConnected}
            />

            {animatingItem && (
                <ItemCard
                    id={animatingItem.id}
                    name={animatingItem.name}
                    isAnimating={true}
                    isSecondCoice={false}
                />
            )}

            {animatingItem && secondPlayerChoice && (
                <ItemCard
                    id={secondPlayerChoice.id}
                    name={secondPlayerChoice.name}
                    isAnimating={true}
                    isSecondCoice={true}
                />
            )}

            <GameResultsTable />
            <button className='reset-button' onClick={() => handleReset()}>Reset</button>

            {isCountingDown && (
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Time Left: {countdown} seconds</p>
                </div>
            )}

            <CustomAlert 
                isOpen={isAlertOpen} 
                message={gameOverMessage} 
                onClose={handleCloseAlert} 
            />
        </div>
    );
};

export default HomePage;
