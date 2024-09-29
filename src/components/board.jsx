import React, { useState, useEffect } from 'react';
import './board.css';

const GamePage = ({ onLeaveGame, gameId, userId }) => {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const [timeLeft, setTimeLeft] = useState(120); // 120 segundos = 2 minutos
  const [tokens, setTokens] = useState([]);
  const [isHost, setIsHost] = useState(true); // Estado para saber si el jugador es el host
  const [gameStarted, setGameStarted] = useState(false); // Estado para saber si la partida ha comenzado

  // Función para elegir un color aleatorio
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const connectWebSocket = async (gameId) => {
    // Conectar al WebSocket usando el gameId y userId
    ws.current = new WebSocket(`ws://localhost:8000/ws/${gameId}/${userId}`);

    // Cuando se abre la conexión
    ws.current.onopen = () => {
      console.log('Conectado al WebSocket');
      // Enviar mensaje de que el usuario se ha unido a la partida
      const startMessage = {
        type: 'start',
        gameId: gameId,     // ID de la partida
      };
      ws.current.send(JSON.stringify(startMessage)); // Enviar el evento "start"
    };
    
    // Manejar mensajes desde el servidor
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Mensaje recibido del servidor:', message);
    };

    // Manejar errores en la conexión WebSocket
    ws.current.onerror = (error) => {
      console.error('Error en el WebSocket:', error);
    };

    // Cerrar la conexión WebSocket
    ws.current.onclose = () => {
      console.log('Conexión WebSocket cerrada');
    };
  };

  // Obtener información de la partida para saber quién es el host
  useEffect(() => {
    const fetchGameInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/games/${gameId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener la información de la partida');
        }

        const data = await response.json();

        // Comparar si el `userId` actual es igual al `host` de la partida
        if (data.host === userId) {
          setIsHost(true); // El usuario es el host
        }
        // Si la partida ya ha comenzado
        if (data.status === 'started') {
          setGameStarted(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchGameInfo();
  }, [gameId, userId]);

  // Función para iniciar la partida
  const handleStartGame = async () => {
    try {
      const response = await fetch(`http://localhost:8000/games/${gameId}/start`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al iniciar la partida');
      }

      setGameStarted(true); // Marcar que la partida ha comenzado
    } catch (error) {
      console.error(error);
    }
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
    if (gameStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, gameStarted]);

  // Formatear tiempo
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="game-page">
      
      {/* Mostrar el botón "Iniciar Partida" solo si el jugador es el host y la partida no ha comenzado */}
      {isHost && !gameStarted && (
        <div className="start-game-container">
          <button className="start-game-button" onClick={handleStartGame}>
            Iniciar Partida
          </button>
        </div>
      )}

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
        <button className="turno-finalizado" disabled={!gameStarted}>
          Finalizar Turno
        </button>

        {/* Botón para abandonar partida */}
        <button className="leave-button" onClick={onLeaveGame}>Abandonar Partida</button>
      </div>
    </div>
  );
};

export default GamePage;
