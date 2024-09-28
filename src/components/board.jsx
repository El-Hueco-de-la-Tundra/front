import React from 'react';
import './board.css';

const BoardPage = ({ onLeaveGame }) => {
const colors = ['red', 'blue', 'green', 'yellow'];

// Función para elegir un color aleatorio de la lista
const getRandomColor = () => {
     return colors[Math.floor(Math.random() * colors.length)];
};
const tokens = [
     { id: 1, color: getRandomColor(), position: { top: '22%', left: '43.65%' } },
     { id: 2, color: getRandomColor(), position: { top: '31%', left: '43.65%' } },
     { id: 3, color: getRandomColor(), position: { top: '40.5%', left: '43.65%' } },
     { id: 4, color: getRandomColor(), position: { top: '50%', left: '43.65%' } },
     { id: 5, color: getRandomColor(), position: { top: '59.5%', left: '43.65%' } },
     { id: 6, color: getRandomColor(), position: { top: '69%', left: '43.65%' } },
     { id: 7, color: getRandomColor(), position: { top: '22%', left: '49.65%' } },
     { id: 8, color: getRandomColor(), position: { top: '31%', left: '49.65%' } },
     { id: 9, color: getRandomColor(), position: { top: '40.5%', left: '49.65%' } },
     { id: 10, color: getRandomColor(), position: { top: '50%', left: '49.65%' } },
     { id: 11, color: getRandomColor(), position: { top: '59.5%', left: '49.65%' } },
     { id: 12, color: getRandomColor(), position: { top: '69%', left: '49.65%' } },
     { id: 13, color: getRandomColor(), position: { top: '22%', left: '55.65%' } },
     { id: 14, color: getRandomColor(), position: { top: '31%', left: '55.65%' } },
     { id: 15, color: getRandomColor(), position: { top: '40.5%', left: '55.65%' } },
     { id: 16, color: getRandomColor(), position: { top: '50%', left: '55.65%' } },
     { id: 17, color: getRandomColor(), position: { top: '59.5%', left: '55.65%' } },
     { id: 18, color: getRandomColor(), position: { top: '69%', left: '55.65%' } },
     { id: 19, color: getRandomColor(), position: { top: '22%', left: '61.65%' } },
     { id: 20, color: getRandomColor(), position: { top: '31%', left: '61.65%' } },
     { id: 21, color: getRandomColor(), position: { top: '40.5%', left: '61.65%' } },
     { id: 22, color: getRandomColor(), position: { top: '50%', left: '61.65%' } },
     { id: 23, color: getRandomColor(), position: { top: '59.5%', left: '61.65%' } },
     { id: 24, color: getRandomColor(), position: { top: '69%', left: '61.65%' } },
     { id: 25, color: getRandomColor(), position: { top: '22%', left: '37.60%' } },
     { id: 26, color: getRandomColor(), position: { top: '31%', left: '37.60%' } },
     { id: 27, color: getRandomColor(), position: { top: '40.5%', left: '37.60%' } },
     { id: 28, color: getRandomColor(), position: { top: '50%', left: '37.60%' } },
     { id: 29, color: getRandomColor(), position: { top: '59.5%', left: '37.60%' } },
     { id: 30, color: getRandomColor(), position: { top: '69%', left: '37.60%' } },
     { id: 31, color: getRandomColor(), position: { top: '22%', left: '31.60%' } },
     { id: 32, color: getRandomColor(), position: { top: '31%', left: '31.60%' } },
     { id: 33, color: getRandomColor(), position: { top: '40.5%', left: '31.60%' } },
     { id: 34, color: getRandomColor(), position: { top: '50%', left: '31.60%' } },
     { id: 35, color: getRandomColor(), position: { top: '59.5%', left: '31.60%' } },
     { id: 36, color: getRandomColor(), position: { top: '69%', left: '31.60%' } },
   ];

  return (
    <div className="board-container">
      {/* Botón de abandonar partida */}
      <button className="leave-button" onClick={onLeaveGame}>Abandonar Partida</button>

      {/* Fichas posicionadas en el tablero */}
      <div className="tokens-container">
        {tokens.map(token => (
          <div
            key={token.id}
            className={`token ${token.color}`}
            style={{ top: token.position.top, left: token.position.left }}
          />
        ))}
      </div>

      {/* Cartas en el tablero */}
      <div className="card-container card-left">
        <div className="card-leftdata">CARTA FIGURA</div>
        <div className="card-leftdata">CARTA FIGURA</div>
        <div className="card-leftdata">CARTA FIGURA</div>
      </div>

      <div className="card-container card-right">
        <div className="card-rightdata">CARTA FIGURA</div>
        <div className="card-rightdata">CARTA FIGURA</div>
        <div className="card-rightdata">CARTA FIGURA</div>
      </div>

      <div className="card-container card-top">
        <div className="card-topdata">CARTA FIGURA</div>
        <div className="card-topdata">CARTA FIGURA</div>
        <div className="card-topdata">CARTA FIGURA</div>
      </div>

      <div className="card-container card-bottom">
        <div className="card-bottomdata">CARTA FIGURA</div>
        <div className="card-bottomdata">CARTA FIGURA</div>
        <div className="card-bottomdata">CARTA FIGURA</div>
      </div>
      <div className="card-container card-bottommove">
      <div className="card-movedata">CARTA MOVIMIENTO</div>
      </div>
      
    </div>
  );
};

export default BoardPage;
