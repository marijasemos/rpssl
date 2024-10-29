import React, { useState } from 'react';
import Modal from 'react-modal';
import './Modal.css'
const JoinGameModal = ({ isOpen, onRequestClose,onRequestPlay, gameCode, setGameCode, onJoin, onConnect, bothConnected, message }) => {
    const [inputCode, setInputCode] = useState('');

    const handleJoinClick = () => {
        if (inputCode.trim()) {
        
             setGameCode(inputCode); // Set the game code based on user input
             onJoin(inputCode);               // Trigger the join function


        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="modal"
            overlayClassName="modal-overlay"
        >
            {!bothConnected ?
            <><h2>Join Game</h2>
            <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter game code"
            />
            <button className='join-button' onClick={handleJoinClick}>Join</button>
            </>
            :  
            <h2>Both players are connected, lets play!</h2>
         } 
         <button className = {`play-button ${!bothConnected ? 'button-disabled' : ''} `} onClick={onRequestPlay}>Play</button>
         <button className = 'cancel-button' onClick={onRequestClose}>Cancel</button>
        </Modal>
    );
};

export default JoinGameModal;
