
import React from 'react';

const ButtonsPage = ({ onCreateGame }) => {
  return (
    <div className="buttons-container">
      <button className="custom-button" onClick={onCreateGame}>Crear partida</button>
      <button className="custom-button">Unirse a partida</button>
    </div>
  );
};

export default ButtonsPage;