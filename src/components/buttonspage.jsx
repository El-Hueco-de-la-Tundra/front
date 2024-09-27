
import React from 'react';

const ButtonsPage = ({ onCreateGame, onListGames }) => {
  return (
    <div className="buttons-container">
      <button className="custom-button" onClick={onCreateGame}>Crear partida</button>
      <button className="custom-button" onClick={onListGames}>Unirse a partida</button>
    </div>
  );
};

export default ButtonsPage;