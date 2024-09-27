import React from 'react';

const ListGames = ({ onBack }) => {
  const partidas = [
    { id: 1, nombre: 'Partida 1' },
    { id: 2, nombre: 'Partida 2' },
    { id: 3, nombre: 'Partida 3' },
  ];

  return (
    <div className="partidas-container">
      <div className="list-title">
        <h1>Lista de Partidas</h1>
      </div>
      <ul className="partidas-list">
        {partidas.map((partida) => (
          <li key={partida.id}>
            {partida.nombre}
            <button className="join-button">Unirse</button>
          </li>
        ))}
      </ul>
      <button className="back-button1" onClick={onBack}>Volver</button>
    </div>
  );
};

export default ListGames;
