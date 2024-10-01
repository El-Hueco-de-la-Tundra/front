import React, { useState, useEffect, useRef } from 'react';
import './board.css';

const GamePage = ({ onLeaveGame, gameId, userId }) => {
  // Función para elegir un color aleatorio

  const colors = ['red', 'blue', 'green', 'yellow'];
  const [timeLeft, setTimeLeft] = useState(120); // 120 segundos = 2 minutos
  const [tokens, setTokens] = useState([]);
  const [isHost, setIsHost] = useState(false); // Saber si el jugador es el host
  const [gameStarted, setGameStarted] = useState(false); // Saber si la partida ha comenzado
  const [players, setPlayers] = useState([]); // Lista de jugadores que se han unido
  const [gameInfo, setGameInfo] = useState(null); // Información de la partida
  const [turnInfo, setTurnInfo] = useState(null); // Información de la partida
  const [myTurn, setMyTurn] = useState(true); // Información de la partida
  const [leaveMessage, setLeaveMessage] = useState(''); // Estado para el mensaje de abandono
  const [winnerMessage, setWinnerMessage] = useState(''); // Estado para el mensaje de ganador
  const [figureCards, setFigureCards] = useState({
    left: [],
    right: [],
    top: [],
    bottom: [],
  });
  const ws = useRef(null); // Usamos `useRef` para almacenar la conexión WebSocket
  const hasConnected = useRef(false); // Nueva bandera para controlar la conexión WebSocket
  const [expectedPlayersCount, setExpectedPlayersCount] = useState(null); // Añadimos el número esperado de jugadores


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

      const playersFromServer = data.users.players.map(playerObj => {
        const [userId, userName] = Object.entries(playerObj)[0];
        return { userId: parseInt(userId), userName };
      });

      console.log('Lista de jugadores obtenida de fetchGameInfo:', playersFromServer);

      setPlayers(playersFromServer);  // Actualiza el estado de los jugadores

      if (data.host_id === userId) {
        setIsHost(true);
      }

      if (data.status === 'started') {
        setGameStarted(true);
      }

      setGameInfo(data); // Guarda información del juego
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTurnInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/game/${gameId}/turn`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener la información de turno');
      }

      const data = await response.json();

      setTurnInfo(data);

      const current_turn = data?.actualPlayer_id;
      console.log("Actual Player ID:", current_turn);
      console.log("Actual User ID:", userId);

      if (parseInt(current_turn) == parseInt(userId)) {
        setMyTurn(true);
      } else {
        setMyTurn(false);
      }

    } catch (error) {
      console.error(error);
    }
  };

  // Función para elegir un color aleatorio
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Conectar al WebSocket
  const connectWebSocket = async (gameId, userId) => {
    if (!hasConnected.current) {
      ws.current = new WebSocket(`ws://localhost:8000/ws/${gameId}/${userId}`);
      hasConnected.current = true; // Marcamos que ya está conectado

      ws.current.onopen = () => {
        console.log('Conectado al WebSocket', userId);
      };
    };
    // Recibir mensajes del servidor
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Mensaje recibido del servidor:', message);

      // Manejar diferentes tipos de mensajes del WebSocket
      switch (message.type) {
        case 'status_start':
          if (!gameStarted) {
            console.log('Partida iniciada, obteniendo jugadores y cartas...');
            setGameStarted(true);
            fetchGameInfo();
            fetchAllFigureCards();
          }
          break;

        case 'status_join':
          if (!gameStarted) {
            fetchGameInfo();
          }
          break;


        case 'status_leave':
          console.log('Recibido mensaje status_leave:', message);
          const leavingPlayerId = message.user_left;
          fetchGameInfo();
          setLeaveMessage(`Jugador ${leavingPlayerId} ha abandonado la partida`);
          setTimeout(() => {
            setLeaveMessage('');
          }, 3000);
          break;

        case 'status_winner':
          setWinnerMessage(`¡El jugador ${userId} ha ganado la partida!`);
          break;

        case 'info':
          setGameInfo(message.game_info);
          break;

        case 'statu_endturn':
          fetchTurnInfo();
          setTimeLeft(120);
          break;

        default:
          console.warn('Evento no reconocido:', message.type);
          console.log(message);
      }
    };

    // Manejar errores en la conexión WebSocket
    ws.current.onerror = (error) => {
      console.error('Error en el WebSocket:', error);
    };

    // Cerrar la conexión WebSocket
    ws.current.onclose = () => {
      console.log('Conexión WebSocket cerrada');
      hasConnected.current = false; // Permitimos reconexión en caso de cierre

    };
  };

  useEffect(() => {
    if (players.length > 0 && gameStarted) {
      console.log('Players actualizados, obteniendo cartas...');
      fetchAllFigureCards(players);  // Llamamos a la función cuando players tiene datos
    }
  }, [players, gameStarted]);


  useEffect(() => {
    fetchGameInfo();
  }, [gameId, userId]);

  // Obtener cartas de los jugadores
  const fetchUserFigureCards = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/games/${gameId}/${userId}/figure-cards`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener las cartas de figura');
      }


      const data = await response.json();
      console.log(`Respuesta completa para el jugador ${userId}:`, data);
      console.log(`Cartas recibidas para el jugador ${userId}:`, data);
      return data.cards || [];

    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // Obtener las cartas de figura de todos los jugadores
  const fetchAllFigureCards = async (playersList) => {
    try {
      const cardsMap = {
        left: [],
        right: [],
        top: [],
        bottom: [],
      };
      console.log('Jugadores OBTENIDOS:', playersList);

      for (let i = 0; i < playersList.length; i++) {
        const player = playersList[i];
        const playerUserId = player.userId;

        const cards = await fetchUserFigureCards(playerUserId);
        if (cards.length > 0) {
          console.log(`Cartas recibidas para el jugador ${playerUserId}:`, cards);
          if (i === 0) {
            cardsMap.bottom = cards;
          } else if (i === 1) {
            cardsMap.left = cards;
          } else if (i === 2) {
            cardsMap.right = cards;
          } else if (i === 3) {
            cardsMap.top = cards;
          }
        } else {
          console.log(`No se encontraron cartas para el jugador ${playerUserId}`);
        }
      }
      setFigureCards(cardsMap);
      console.log('Cartas mapeadas correctamente:', cardsMap);
      console.log('Cartas de los jugadores:', cardsMap);
    } catch (error) {
      console.error(error);
    }
  };



  // Conectar al WebSocket cuando la partida empiece o cuando el usuario entre
  useEffect(() => {
    if (!hasConnected.current) {
      connectWebSocket(gameId, userId);
    }
  }, [gameId, userId]);


  // Función para abandonar la partida
  const handleLeaveGame = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: 'leave', gameId, userId }));
      ws.current.close();
    }
    onLeaveGame();
  };

  // Función para iniciar la partida (solo si es el host)
  const handleStartGame = async () => {
    if (isHost && !gameStarted) {
      console.log('Iniciando partida como host...');
      setGameStarted(true);
      fetchTurnInfo();
      ws.current.send(JSON.stringify({ type: 'start', gameId, userId }));
    }
  };

  const handleEndTurn = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      // Solo enviar si el WebSocket está en estado OPEN
      ws.current.send(JSON.stringify({ type: 'endturn', gameId, userId }));
      console.log("Turno finalizado, mensaje enviado.");
      fetchGameInfo();
    } else if (ws.current && ws.current.readyState === WebSocket.CONNECTING) {
      console.error("El WebSocket aún se está conectando. Intenta de nuevo en unos momentos.");
    } else {
      console.error("El WebSocket no está disponible. Estado:", ws.current ? ws.current.readyState : "desconocido");
    }
  };

  useEffect(() => {
    console.log("TurnInfo:", turnInfo);
    console.log("Es mi turno:", myTurn);
  }, [turnInfo, myTurn]);

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


  useEffect(() => {
    let timer;
    if (gameStarted && myTurn) {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
        }, 1000);
      } else {
        handleEndTurn();
      }
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timeLeft, gameStarted, myTurn]);

  // Formatear tiempo
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };



  const cardImages = import.meta.glob('/src/designs/*.svg', { eager: true });

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
      {leaveMessage && (<div className="leave-notification"> {leaveMessage} </div>)}
      {/* Mostrar mensaje de ganador */}
      {winnerMessage && (<div className="winner-notification">{winnerMessage}</div>)}
      <div className="cards">
        <div className="card-container card-left">
          {figureCards.left.map((card) => (
            <div key={card.id} className="card-leftdata">
              <img src={cardImages[`./src/designs/${card.type}.svg`]} alt={card.type} />
            </div>
          ))}
        </div>
        <div className="card-container card-right">
          {figureCards.right.map((card) => (
            <div key={card.id} className="card-rightdata">
              <img src={cardImages[`./src/designs/${card.type}.svg`]} alt={card.type} />
              </div>
          ))}
        </div>
        <div className="card-container card-top">
          {figureCards.top.map((card) => (
            <div key={card.id} className="card-topdata">
              <img src={cardImages[`./src/designs/${card.type}.svg`]} alt={card.type} />
              </div>
          ))}
        </div>
        <div className="card-container card-bottom">
          {figureCards.bottom.map((card) => (
            <div key={card.id} className="card-bottomdata">
              <img src={cardImages[`./src/designs/${card.type}.svg`]} alt={card.type} />
              </div>
          ))}
        </div>
      </div>

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
          <p>Color Bloqueado: </p>
          <p>Jugador Activo: {myTurn ? 'Tu turno' : `Jugador ${turnInfo?.actualPlayer_id}`}</p>
        </div>

        {/* <div className="cards">
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
        </div> */}
        <button className="turno-finalizado" disabled={!gameStarted || !myTurn} onClick={handleEndTurn}>
          Finalizar Turno
        </button>
        <button className="leave-button" onClick={handleLeaveGame}>
          Abandonar Partida
        </button>
      </div>
    </div>
  );
};

export default GamePage;
