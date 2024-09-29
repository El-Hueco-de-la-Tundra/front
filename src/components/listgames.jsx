import React, { useState, useEffect, useRef } from 'react';

const ListGames = ({ onBack, onJoinGame, userId }) => {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(null); // Para manejar el estado de unirse a la partida
  const [userName, setUserName] = useState(''); // Estado para almacenar el nombre del usuario
  const [userNameSubmitted, setUserNameSubmitted] = useState(false); // Controla si se ha ingresado el nombre
  const ws = useRef(null); // Referencia a WebSocket

  // Función para obtener la lista de partidas
  const handleListGames = async () => {
    try {
      const response = await fetch('http://localhost:8000/games/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener partidas: ${response.statusText}`);
      }

      const data = await response.json();
      const partidasDisponibles = data.filter((partida) => !partida.in_game);
      setPartidas(partidasDisponibles); // Asigna solo las partidas no jugadas
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Función para conectarse al WebSocket con game_id y user_id
  const connectWebSocket = async (gameId, userId) => {
    // Conectar al WebSocket usando el gameId y userId
    ws.current = new WebSocket(`ws://localhost:8000/ws/${gameId}/${userId}`);

    // Cuando se abre la conexión
    ws.current.onopen = () => {
      console.log('Conectado al WebSocket');
      // Enviar mensaje de que el usuario se ha unido a la partida
      const joinMessage = {
        type: 'join',
        userId: userId, // Nombre del usuario
        gameId: gameId,     // ID de la partida
      };
      ws.current.send(JSON.stringify(joinMessage)); // Enviar el evento "join"
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

  // Función para unirse a una partida con el gameId, userName y password
  const handleJoinGame = async (gameId, password) => {
    setJoining(gameId); // Marcamos la partida a la que se está intentando unir

    try {
      const response = await fetch(`http://localhost:8000/games/join`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_id: gameId,
          user_name: userName,
          password: password || "", // Contraseña (o vacío si no es privada)
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al unirse a la partida: ${response.statusText}`);
      }

      const data = await response.json();

      // Conectar al WebSocket después de unirse a la partida
      connectWebSocket(gameId, userId);

      // Cambiar al frame del tablero
      onJoinGame();

    } catch (error) {
      console.error(`Error: ${error.message}`);
    } finally {
      setJoining(null); // Restablecemos el estado de "unirse"
    }
  };

  // Ejecuta la función de obtener partidas al montar el componente
  useEffect(() => {
    if (userNameSubmitted) {
      handleListGames();
    }

    // Limpiar la conexión WebSocket cuando el componente se desmonte
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userNameSubmitted]);

  // Si el nombre de usuario no se ha ingresado, muestra un formulario para ingresarlo
  if (!userNameSubmitted) {
    return (
      <div className="username-container">
        <h1>Ingresa tu nombre para continuar</h1>
        <form onSubmit={(e) => {
          e.preventDefault(); // Evita el comportamiento por defecto del formulario
          if (userName.trim()) {
            setUserNameSubmitted(true); // Marca como ingresado el nombre del usuario
          }
        }}>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)} // Actualiza el nombre del usuario
            placeholder="Nombre de usuario"
            required
          />
          <button type="submit">Continuar</button>
        </form>
      </div>
    );
  }

  // Muestra el listado de partidas si ya se ingresó el nombre de usuario
  if (loading) {
    return <p>Cargando partidas...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="partidas-container">
      <div className="list-title">
        <h1>Lista de Partidas</h1>
      </div>
      <ul className="partidas-list">
        {partidas.map((partida) => (
          <li key={partida.id}>
            <h3>{partida.name}</h3> {/* Muestra el nombre de la partida */}
            <p>Jugadores: {partida.users.min} - {partida.users.max}</p> {/* Muestra el rango de jugadores */}
            <p>Partida {partida.is_private ? 'Privada' : 'Pública'}</p> {/* Muestra si es privada o pública */}
            {partida.is_private && (
              <input
                type="password"
                placeholder="Contraseña"
                onChange={(e) => partida.password = e.target.value} // Guardar la contraseña temporalmente
              />
            )}
            <button
              className="join-button"
              onClick={() => handleJoinGame(partida.id, partida.password)} // Pasa el gameId y password (si es privada)
              disabled={joining === partida.id} // Deshabilita el botón si ya te estás uniendo a esa partida
            >
              {joining === partida.id ? 'Uniéndote...' : 'Unirse'}
            </button>
          </li>
        ))}
      </ul>
      <div className="back-button-container">
        <button className="back-button1" onClick={onBack}>Volver</button>
      </div>
    </div>
  );
};

export default ListGames;
