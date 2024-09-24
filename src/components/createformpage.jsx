import React, { useState } from 'react';
import useWebSocket from '../hooks/useWebSockets.jsx';
import './form.css';

const CreateFormPage = ({ onGoBack }) => {
  const [gameType, setGameType] = useState('public');  // Estado para controlar si es pública o privada
  const [gameName, setGameName] = useState('');        // Estado para manejar el nombre de la partida
  const [maxPlayers, setMaxPlayers] = useState('');    // Estado para manejar el máximo de jugadores
  const [minPlayers, setMinPlayers] = useState('');    // Estado para manejar el mínimo de jugadores
  const [password, setPassword] = useState('');        // Estado para manejar la contraseña
  const [userName, setUserName] = useState('');        // Estado para manejar el usuario


  // Hook para WebSocket
  const { sendMessage } = useWebSocket('ws://localhost:8000/ws', (data) => {
    console.log('Mensaje recibido del backend:', data);
  });

  // Función para manejar la creación de la partida
  const handleCreateGame = (e) => {
    e.preventDefault();  // Evita que la página se recargue

    // Prepara los datos del juego
    const gameData = {
      name: gameName,
      userName: userName,
      maxPlayers: parseInt(maxPlayers, 10),
      minPlayers: parseInt(minPlayers, 10),
      password: gameType === 'private' ? password : null  // Solo enviar la contraseña si es privada
    };
    console.log('Datos del juego a enviar:', gameData);  // Verificar los datos antes de enviarlos
    // Envía los datos al servidor WebSocket
    sendMessage(JSON.stringify({ action: 'create_game', data: gameData }));
    console.log('Datos enviados al backend:', gameData);
  };

  // Función para manejar el cambio entre pública y privada
  const handleGameTypeChange = (event) => {
    setGameType(event.target.value);
  };

  return (
    <div>
      {/* Botón para volver */}
      <button className="back-button" onClick={onGoBack}>←</button>
      
      {/* Campo Nombre de Usuario separado y posicionado */}
      <div className="user-name-container">
        <label htmlFor="userName" className="user-label">Nombre de Usuario</label>
        <div className="input-container">
          <input
            type="text"
            name="userName"
            id="userName" //Se esta enviando la informacion??
            placeholder="Escribe su nombre de usuario"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}  // Maneja el estado del nombre
            required
          />
        </div>
      </div>

      {/* Formulario de crear partida */}
      <div className="form-container">
        <div className="title">
          <h2>Insertar Información de Partida</h2>
        </div>

        <form className="custom-form" onSubmit={handleCreateGame}>
          <div className="form-group">
            <label htmlFor="gameName">Nombre de la partida</label>
            <div className="input-container">
              <input
                type="text"
                name="gameName"
                id="gameName"
                placeholder="Escribe el nombre de la partida"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}  // Maneja el estado del nombre
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="maxPlayers">Máximo de jugadores</label>
            <div className="input-container">
              <input
                type="number"
                name="maxPlayers"
                id="maxPlayers"
                placeholder="Número máximo de jugadores"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}  // Maneja el estado de maxPlayers
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="minPlayers">Mínimo de jugadores</label>
            <div className="input-container">
              <input
                type="number"
                name="minPlayers"
                id="minPlayers"
                placeholder="Número mínimo de jugadores"
                value={minPlayers}
                onChange={(e) => setMinPlayers(e.target.value)}  // Maneja el estado de minPlayers
                required
              />
            </div>
          </div>

          {/* Opciones de partida pública o privada */}
          <div className="form-group">
            <label>Tipo de partida</label>
            <div className="radio-container">
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
              <label>
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
                  onChange={(e) => setPassword(e.target.value)}  // Maneja el estado de la contraseña
                  required
                />
              </div>
            </div>
          )}
          <button type="submit" className="custom-button1">Crear</button>
        </form>
      </div>
    </div>
  );
};

export default CreateFormPage;
