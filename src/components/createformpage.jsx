import React, { useState } from 'react';

const CreateFormPage = () => {
  const [gameType, setGameType] = useState('public');  // Estado para controlar si es pública o privada
  const [password, setPassword] = useState('');        // Estado para manejar la contraseña

  // Función para manejar el cambio entre pública y privada
  const handleGameTypeChange = (event) => {
    setGameType(event.target.value);
  };

  return (
    <div className="form-container">
      <div className="title">
        <h2>Insertar Información de Partida</h2>
      </div>
      <form className="custom-form">
        <div className="form-group">
          <label htmlFor="gameName">Nombre de la partida</label>
          <div className="input-container">
            <input type="text" name="gameName" id="gameName" placeholder="Escribe el nombre de la partida" />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="maxPlayers">Máximo de jugadores</label>
          <div className="input-container">
            <input type="number" name="maxPlayers" id="maxPlayers" placeholder="Número máximo de jugadores" />
          </div>
        </div>

        {/* Opciones de partida pública o privada */}
        <div className="form-group">
          <label>Tipo de partida</label>
          <div>
            <label>
              <input
                type="radio"
                name="gameType"
                value="public"
                checked={gameType === 'public'}
                onChange={handleGameTypeChange}
              />
              Pública
            </label>
            <label style={{ marginLeft: '20px' }}>
              <input
                type="radio"
                name="gameType"
                value="private"
                checked={gameType === 'private'}
                onChange={handleGameTypeChange}
              />
              Privada
            </label>
          </div>
        </div>

        {/* Si la partida es privada, mostramos el campo de contraseña */}
        {gameType === 'private' && (
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-container">
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Introduce una contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        <button type="submit" className="custom-button1">Crear</button>
      </form>
    </div>
  );
};

export default CreateFormPage;
