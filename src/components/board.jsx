import React, { useState, useEffect } from 'react';
import './board.css';

const GamePage = ({ onLeaveGame }) => {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const [timeLeft, setTimeLeft] = useState(120); // 120 segundos = 2 minutos
  const [tokens, setTokens] = useState([]);

  // Función para elegir un color aleatorio
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Generar posiciones de las fichas
  useEffect(() => {
    const generatedTokens = Array.from({ length: 36 }, (_, index) => ({
      id: index + 1,
      color: getRandomColor(),
      position: {
        gridRow: Math.floor(index / 6) + 1, // Fila en la cuadrícula
        gridColumn: (index % 6) + 1,        // Columna en la cuadrícula
      },
    }));
    setTokens(generatedTokens);
  }, []);

  // Temporizador
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  // Formatear tiempo
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="game-page">
      
      {/* Tablero */}
      <div className="board-container">
        {tokens.map((token) => (
          <div 
            key={token.id} 
            className={`token ${token.color}`} 
            style={{ 
              gridColumn: token.position.gridColumn,
              gridRow: token.position.gridRow 
            }}
          />
        ))}
      </div>

      {/* Información del turno y cartas */}
      <div className="info-container">
        {/* Información de turno */}
        <div className="turn-info">
          <p>Tiempo restante: {formatTime(timeLeft)}</p>
          <p2>Color Bloqueado: Rojo</p2>
          <p3>Jugador Activo: Nombre</p3>
        </div>

        {/* Cartas en el tablero */}
        <div className="cards">
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

        {/* Botón de finalizar turno */}
        <button className="turno-finalizado">Finalizar Turno</button>

        {/* Botón para abandonar partida */}
        <button className="leave-button" onClick={onLeaveGame}>Abandonar Partida</button>
      </div>
    </div>
  );
};

export default GamePage;
