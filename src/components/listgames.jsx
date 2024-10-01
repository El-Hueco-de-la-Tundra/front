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
  
      // Verificamos si la respuesta es 200
      if (response.status === 200) {
        const data = await response.json();
  
        // Obtener la lista de jugadores
        const players = data.users.players;
  
        // Verifica si hay jugadores en la lista
        if (players.length > 0) {
          // Obtiene el último jugador (último objeto en el array)
          const lastPlayerObj = players[players.length - 1];
  
          // Extrae la ID del último jugador (la clave del objeto)
          const lastPlayerId = Object.keys(lastPlayerObj)[0];
          console.log("User ID:", lastPlayerId);
          userId = lastPlayerId;
        }
          // Cambiar al frame del tablero si todo está bien
        console.log("Entrando al tablero...");
        onJoinGame(userId, gameId); // Cambiar al frame del tablero
  
      } 
      else if (response.status === 403) {
        // Error de partida llena
        console.error("Error 403: El juego está lleno.");
        throw new Error("El juego está lleno. No puedes unirte.");
      } 
      else if (response.status === 404) {
        // Error de juego no encontrado
        console.error("Error 404: El juego no fue encontrado.");
        throw new Error("El juego no fue encontrado.");
      } 
      else if (response.status === 422) {
        // Error de validación
        const errorData = await response.json();
        console.error("Error 422: Error de validación.");
        throw new Error(`Error de validación: ${errorData.detail}`);
      } 
      else {
        // Otros errores
        console.error(`Error ${response.status}: Error inesperado.`);
        throw new Error(`Error inesperado: ${response.statusText}`);
      }
  
    } catch (error) {
      // Mostrar el mensaje de error en la interfaz y detener el flujo
      console.error("Error capturado:", error.message);
      setFeedbackMessage(error.message);
      return; // Asegurarse de retornar aquí para detener completamente el flujo
    } finally {
      setJoining(null); // Restablecemos el estado de "unirse"
    }
  };

  // Ejecuta la función de obtener partidas al montar el componente
  useEffect(() => {
    if (userNameSubmitted) {
      handleListGames();
    }
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
