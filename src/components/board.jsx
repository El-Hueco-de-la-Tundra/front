import React, { useState, useEffect, useRef } from 'react';
import './board.css';
import Movement from './movement';

const BoardPage = ({ onLeaveGame, gameId, userId }) => {
  const { fetchGameTokens} = Movement({ gameId, userId});
  const [previousTokens, setPreviousTokens] = useState([]); // Estado para almacenar las fichas anteriores
  const colors = ['red', 'blue', 'green', 'yellow'];
  const [timeLeft, setTimeLeft] = useState(120); // 120 segundos = 2 minutos
  const [tokens, setTokens] = useState([]);
  const [isHost, setIsHost] = useState(false); // Saber si el jugador es el host
  const [gameStarted, setGameStarted] = useState(false); // Saber si la partida ha comenzado
  const [players, setPlayers] = useState([]); // Lista de jugadores que se han unido
  const [gameInfo, setGameInfo] = useState(null); // Información de la partida
  const [turnInfo, setTurnInfo] = useState(null); // Información de la partida
  const [myTurn, setMyTurn] = useState(false); // Información de la partida
  const [leaveMessage, setLeaveMessage] = useState(''); // Estado para el mensaje de abandono
  const [winnerMessage, setWinnerMessage] = useState(''); // Estado para el mensaje de ganador
  const [figureCards, setFigureCards] = useState({
    left: [],
    right: [],
    top: [],
    bottom: [],
  });
  const [showAllMovementCards, setShowAllMovementCards] = useState(false);
  const [movementCards, setMovementCards] = useState([]);
  const ws = useRef(null); // Usamos `useRef` para almacenar la conexión WebSocket
  const hasConnected = useRef(false); // Nueva bandera para controlar la conexión WebSocket
  const { handleCardClick, handleTokenClick } = Movement({
    gameId,
    userId,
    movementCards,
  });



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
            fetchAndSetTokens();
            fetchTurnInfo();

          }
          break;

        case 'status_join':
          if (!gameStarted) {
            fetchGameInfo();
          }
          break;

        case 'status_move':
          console.log('Movimiento detectado, actualizando fichas...');
          fetchAndSetTokens();
          fetchUserMovementCards().then((cards) => {
          setMovementCards(cards);})
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

        case 'status_endturn':
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

  const fetchUserMovementCards = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/game/${gameId}/${userId}/movements`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener las cartas de movimiento');
      }

      const data = await response.json();
      console.log(`Cartas de movimiento recibidas para el jugador ${userId}:`, data);
      return data.cards || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
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
      const currentPlayerIndex = players.findIndex(player => player.userId === userId);

      console.log('Jugador actual:', userId, 'en la posición', currentPlayerIndex);

      // Reorganiza los jugadores de modo que el jugador actual siempre esté primero (en bottom)
      const reorderedPlayers = [
        ...players.slice(currentPlayerIndex),   // Jugadores después del jugador actual
        ...players.slice(0, currentPlayerIndex) // Jugadores antes del jugador actual
      ];
      for (let i = 0; i < reorderedPlayers.length; i++) {
        const player = reorderedPlayers[i];
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

  useEffect(() => {
    if (!hasConnected.current) {
      connectWebSocket(gameId, userId);
    }
  }, [gameId, userId]);

  useEffect(() => {
    if (gameStarted) {
      fetchUserMovementCards().then((cards) => {
        setMovementCards(cards);
      });
    }
  }, [gameStarted]);

  // Función para abandonar la partida
  const handleLeaveGame = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'leave', gameId, userId }));
      console.log('SE MANDO LEAVE');


      setTimeout(() => {
        ws.current.close();
        onLeaveGame();
      }, 100); // Espera 100 milisegundos
    } else {
      onLeaveGame();
    }
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
  const fetchAndSetTokens = async () => {
    console.log('Fetching tokens...');
  
    const tokensData = await fetchGameTokens(); 
    
    if (!tokensData || tokensData.length === 0) {
      console.error('No se recibieron fichas del servidor o el array está vacío');
      return
    }
    console.log('tokensData:', tokensData); // Verifica lo que llega
    
    const fetchedTokens = tokensData.map((token, index) => {
      const mappedToken = {
        id: token.id,
        color: token.color,
        position: {
          gridRow: token.y_coordinate,
          gridColumn: token.x_coordinate,
        },
      };
      console.log('Mapped token:', mappedToken);
      return mappedToken;
    });
    if (tokens.length > 0) {
      console.log('ACTUALIZANDO previousTokens antes de cambiar los tokens');
      setPreviousTokens([...tokens]);  // Guarda los tokens actuales antes de actualizarlos
    } 
    setTokens([...fetchedTokens]);
    console.log('Tokens state updated:', fetchedTokens);
  };
  
  useEffect(() => {
    if (tokens.length > 0) {
      console.log('ACTUALIZANDO previousTokens antes de cambiar los tokens');
      setPreviousTokens([...tokens]);
    }
  }, [tokens]);

  useEffect(() => {
    console.log('Tokens state changed:', tokens);
  }, [tokens]);

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


 
  // Función para comparar posiciones de tokens y aplicar la clase de animación si la posición cambió
  const getMovementClass = (token) => {
    if (previousTokens.length === 0) {
      console.log('No hay tokens anteriores para comparar');
      return '';
    }
    const previousToken = previousTokens.find((prevToken) => prevToken.id == token.id);
    console.log('Comparando el token actual:', token);
    console.log('Token anterior:', previousToken);
    if (
      previousToken &&
      (previousToken.position.gridRow !== token.position.gridRow || 
      previousToken.position.gridColumn !== token.position.gridColumn)
    ) {
      console.log(`El token con id ${token.id} se ha movido de posición`);
      setTimeout(() => {
        document.querySelector(`.token-${token.id}`).classList.remove('token-move');
        document.querySelector(`.token-${token.id}`).offsetWidth; // Fuerza el reflow
        document.querySelector(`.token-${token.id}`).classList.add('token-move');
      }, 10);
      return `token-${token.id} token-move`; 
    }
    return `token-${token.id}`; 
  };

  useEffect(() => {
    let timer;

    if (gameStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && myTurn) {
      handleEndTurn();
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
      {winnerMessage && (<div className="winner-notification">{winnerMessage}
        <button
          className="ok-button" onClick={handleLeaveGame}>OK
        </button>
      </div>)}

      <div className="cards">
        <div className="card-container card-left">
          {figureCards.left.map((card) => (
            <div key={card.id} className="card-leftdata">
              <img src={`./src/designs/${card.type}.svg`} alt={card.type} />
            </div>
          ))}
        </div>
        <div className="card-container card-right">
          {figureCards.right.map((card) => (
            <div key={card.id} className="card-rightdata">
              <img src={`./src/designs/${card.type}.svg`} alt={card.type} />
            </div>
          ))}
        </div>
        <div className="card-container card-top">
          {figureCards.top.map((card) => (
            <div key={card.id} className="card-topdata">
              <img src={`./src/designs/${card.type}.svg`} alt={card.type} />
            </div>
          ))}
        </div>
        <div className="card-container card-bottom">
          {figureCards.bottom.map((card) => (
            <div key={card.id} className="card-bottomdata">
              <img src={`./src/designs/${card.type}.svg`} alt={card.type} />
            </div>
          ))}
        </div>
      </div>

      <div className="card-container card-bottommove">
        {movementCards.length > 0 && (
          <>
          <button
              className="arrow-button"
              onClick={() => setShowAllMovementCards(!showAllMovementCards)}
            >
              {showAllMovementCards ? '▲' : '▼'}
            </button>

            <div className="card-movedata">
              <img
                onClick={() => handleCardClick(movementCards[0])}
                src={`./src/designs/${movementCards[0].mov_type}.svg`}
                alt={movementCards[0].mov_type}
              />
            </div>
            
            {showAllMovementCards && movementCards.slice(1).map((card) => (
              <div 
                key={card.id}
                className="card-movedata" 
                onClick={() => myTurn && handleCardClick(card)}>
                <img src={`./src/designs/${card.mov_type}.svg`} alt={card.mov_type} />
              </div>
            ))}
          </>
        )}
      </div>
      {/* Tablero */}
      <div className={`board-container ${!gameStarted ? 'board-disabled' : ''}`}>
        {tokens.length > 0 ? (
          tokens.map((token) => (
            <div
              key={token.id}
              className={`token ${token.color} ${getMovementClass(token)} `}
              onClick={() => myTurn && handleTokenClick(token.id)}
              style={{
                gridColumn: token.position.gridColumn,
                gridRow: token.position.gridRow,
              }}
            />
          ))
        ) : (
          gameStarted && <p>No hay fichas para mostrar.</p>
        )}
      </div>

      {/* Información del turno y cartas */}
      <div className="info-container">
        <div className="turn-info">
          <p>Tiempo restante: {formatTime(timeLeft)}</p>
          <p>Color Bloqueado: </p>
          <p>
            Jugador Activo: {myTurn ? 'Tu turno' : turnInfo?.actualPlayer_id ? `Jugador ${turnInfo.actualPlayer_id}` : 'Desconocido'}
          </p>
        </div>


        <button className="leave-button" onClick={handleLeaveGame}>
          Abandonar Partida
        </button>
        {myTurn && (<button className="turno-finalizado" disabled={!gameStarted || !myTurn} onClick={handleEndTurn}>
          Finalizar Turno
        </button>)}
      </div>
    </div>
  );
};

export default BoardPage;
