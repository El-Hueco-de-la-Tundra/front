
import React from 'react';

const ButtonsPage = ({ onCreateGame, onListGames }) => {
  return (
    <div className="buttons-container">
      <button className="custom-button" onClick={onCreateGame}>Crear Partida</button>
      <button className="custom-button" onClick={onListGames}>Unirse a Partida</button>
    </div>
  );
};

export default ButtonsPage;