import React from 'react';
import './CustomAlert.css';

const CustomAlert = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="custom-alert-overlay" onClick={onClose}>
            <div className="custom-alert-content" onClick={(e) => e.stopPropagation()}>
                <p>{message}</p>
                <button onClick={onClose}>OK</button>
            </div>
        </div>
    );
};

export default CustomAlert;
