import React, { useState, useEffect, useRef } from 'react';
import './board.css';

const GamePage = ({ onLeaveGame, gameId, userId }) => {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const [timeLeft, setTimeLeft] = useState(120); // 120 segundos = 2 minutos
  const [tokens, setTokens] = useState([]);
  const [isHost, setIsHost] = useState(false); // Saber si el jugador es el host
  const [gameStarted, setGameStarted] = useState(false); // Saber si la partida ha comenzado
  const [players, setPlayers] = useState([]); // Lista de jugadores que se han unido
  const [gameInfo, setGameInfo] = useState(null); // Información de la partida
  const [leaveMessage, setLeaveMessage] = useState(''); // Estado para el mensaje de abandono
  const ws = useRef(null); // Usamos `useRef` para almacenar la conexión WebSocket

  // Función para elegir un color aleatorio
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Conectar al WebSocket
  const connectWebSocket = async (gameId, userId) => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/${gameId}/${userId}`);

    // Cuando se abre la conexión
    ws.current.onopen = () => {
      console.log('Conectado al WebSocket');
    };

    // Recibir mensajes del servidor
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Mensaje recibido del servidor:', message);

      // Manejar diferentes tipos de mensajes del WebSocket
      switch (message.type) {
        case 'status_start':
          setGameStarted(true);
          break;
        case 'status_join':
          // Un jugador se ha unido
          setPlayers((prevPlayers) => [...prevPlayers, message.userId]);
          break;
        case 'status_leave':
            // Un jugador ha abandonado la partida
            const leavingPlayerId = message.userId;
            setLeaveMessage(`Jugador ${leavingPlayerId} ha abandonado la partida`);
            setPlayers((prevPlayers) => prevPlayers.filter((p) => p.userId !== message.userId));
            // Eliminar el mensaje después de 3 segundos
          setTimeout(() => {
            setLeaveMessage('');
          }, 3000);
          break;
          
        break;
          // Manejar otros eventos como status_winner, status_no_players, etc
        case 'info':
          // Actualizar la información del juego (ejemplo: cartas, tokens, etc.)
          setGameInfo(message.game_info);
          break;
        default:
          console.warn('Evento no reconocido:', message.type);
      }
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

        // Si el userId es igual al host de la partida, se convierte en el host
        if (data.host_id === userId) {
          setIsHost(true);
        }

        // Si la partida ya ha comenzado
        if (data.status === 'started') {
          setGameStarted(true);
        }

        // Guardar información general del juego
        setGameInfo(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchGameInfo();
  }, [gameId, userId]);

  // Conectar al WebSocket cuando la partida empiece o cuando el usuario entre
  useEffect(() => {
    if (gameInfo || gameStarted) {
      connectWebSocket(gameId, userId);
    }

  }, [gameInfo, gameStarted, gameId, userId]);

  // Función para abandonar la partida
  const handleLeaveGame = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ type:'leave', gameId, userId }));
      ws.current.close();
    }
    onLeaveGame();
  };

  // Función para iniciar la partida (solo si es el host)
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
      ws.current.send(JSON.stringify({ type: 'start', gameId, userId })); // Notificar mediante WebSocket
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
      {/* Contenedor de la capa oscura y el mensaje "Esperando jugadores" */}
      {!gameStarted && (
        <div className="overlay">
          <div className="waiting-message">
            <h2>Esperando jugadores...</h2>
            {isHost && (
              <button className="start-game-button" onClick={handleStartGame}>
                Iniciar Partida
              </button>
            )}
            <button className="leave-button" onClick={handleLeaveGame}>
              Abandonar Partida
            </button>
          </div>
        </div>
      )}
        {/* Mostrar mensaje cuando un jugador abandona */}
        {leaveMessage && (
        <div className="leave-notification">
          {leaveMessage}
        </div>
      )}


      {/* Tablero */}
      <div className={`board-container ${!gameStarted ? 'board-disabled' : ''}`}>
        {tokens.map((token) => (
          <div
            key={token.id}
            className={`token ${token.color}`}
            style={{
              gridColumn: token.position.gridColumn,
              gridRow: token.position.gridRow,
            }}
          />
        ))}
      </div>
      
      {/* Información del turno y cartas */}
      <div className="info-container">
        <div className="turn-info">
          <p>Tiempo restante: {formatTime(timeLeft)}</p>
          <p>Color Bloqueado: Rojo</p>
          <p>Jugador Activo: Nombre</p>
        </div>

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
        <button className="turno-finalizado" disabled={!gameStarted}>
          Finalizar Turno
        </button>
        <button className="leave-button" onClick={onLeaveGame}>
              Abandonar Partida
            </button>
      </div>
    </div>
  );
};

export default GamePage;
