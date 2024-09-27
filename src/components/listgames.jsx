import React, { useState, useEffect } from 'react';

const ListGames = ({ onBack }) => {
  // Estado para almacenar las partidas
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener la lista de partidas
  const handleListGames = async () => {
    try {
      const response = await fetch('http://localhost:8000/room/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener partidas: ${response.statusText}`);
      }

      const data = await response.json();
      // Filtra las partidas que no están en juego (in_game: false)
      const partidasDisponibles = data.filter((partida) => !partida.in_game);
      setPartidas(partidasDisponibles);  // Asigna solo las partidas no jugadas
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Ejecuta la función de obtener partidas al montar el componente
  useEffect(() => {
    handleListGames();
  }, []);

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
            <button className="join-button">Unirse</button>
          </li>
        ))}
      </ul>
      <button className="back-button1" onClick={onBack}>Volver</button>
    </div>
  );
};

export default ListGames;
