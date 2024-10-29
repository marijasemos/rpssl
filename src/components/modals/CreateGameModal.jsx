import React from 'react';
import Modal from 'react-modal';
 import './Modal.css';

const CreateGameModal = ({ isOpen, onRequestClose, onRequestPlay, gameCode, playerId, message, bothConnected }) => {
    
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="modal"
            overlayClassName="modal-overlay"
        >
            <h2>{message}</h2>
            {gameCode && playerId && !bothConnected && (
                <div className="game-info">

                    <p>Waiting for second player to join</p>
                </div>
            )}

            <button className = {`play-button ${!bothConnected ? 'button-disabled' : ''} `} onClick={onRequestPlay}>Play</button>
]
            <button className = 'cancel-button' onClick={onRequestClose}>Cancel</button>
        </Modal>
    );
};

export default CreateGameModal;
