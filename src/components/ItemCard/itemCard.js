import React from 'react';
import imageMapper from '../../helpers/imageMapper';
import './itemCard.css';

const ItemCard = ({ id, name, onClick, isAnimating, isSecondCoice, statusGame }) => {
  const imageSrc = imageMapper[name];
  
  const className = `item-card ${isAnimating ? 'animated-icon animate' : ''} 
  ${isSecondCoice ? 'animated-second-icon animate' : ''}
     ${statusGame != null ? 'icon-disabled' : ''
  }`;
  
  return (
    <div className={className} onClick={statusGame == null ? onClick : undefined}>
      {imageSrc ? (
        <img src={imageSrc} alt={name} />
      ) : (
        <p>No image available</p>
      )}
      <h3>{name}</h3>
    </div>
  );
};

export default ItemCard;
