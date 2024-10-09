import React, { useState } from 'react';

const Movement = ({ gameId, userId, movementCards, onMoveCompleted }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedTokens, setSelectedTokens] = useState([]);

  // Función para seleccionar una carta de movimiento
  const handleCardClick = (card) => {
    if (parseInt(selectedTokens.length) == 0) {
      setSelectedCard(card); // Seleccionamos la carta
      console.log('Carta seleccionada:', card);
    } else {
        console.log('Deselecciona token o termina movimiento');
        //algo que diga que primero deseleccione tokens o termine el movimiento
    }
  };

  // Función para seleccionar una ficha
  const handleTokenClick = (tokenId) => {
    if (!selectedCard) {
        console.log('No hay carta seleccionada');
      return;
    }

    if (selectedTokens.includes(tokenId)) {
        console.log('Deseleccionando token', tokenId);
        setSelectedTokens((prev) => prev.filter((id) => id !== tokenId));
      return;
    }
    
    if (parseInt(selectedTokens.length) == 0) {
        console.log('Token seleccionado:',tokenId);
        selectedTokens[0] = tokenId;
        return;
    }

    if (parseInt(selectedTokens.length) == 1) {
        console.log('Token seleccionado:',tokenId);
        selectedTokens[1] = tokenId;
    }

    // Si ya hay dos fichas seleccionadas, proceder al movimiento
    if (parseInt(selectedTokens.length) == 2) {
        console.log('Ejecutando movimiento:', selectedCard.card_id);
      executeMove(selectedCard.card_id, selectedTokens[0], selectedTokens[1]);
    }
  };

  // Función para ejecutar el movimiento
  const executeMove = async (moveId, token1Id, token2Id) => {
    try {
      const response = await fetch(`http://localhost:8000/game/${gameId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_id: gameId,
          player_id: userId,
          move_id: moveId,
          token1_id: token1Id,
          token2_id: token2Id,
        }),
      });

      if (response.status === 404) {
        // Si es un 404, significa que no es valido el movimiento.
        console.warn('Movimiento invalido.');
        return;  // Salimos del bloque para no lanzar un error
      }

      if (!response.ok) {
        throw new Error('Error al ejecutar el movimiento');
      }

      const data = await response.json();
      console.log('Movimiento ejecutado con éxito:', data);
      setSelectedCard(null);
      setSelectedTokens([]);
    } catch (error) {
      console.error('Error al ejecutar el movimiento:', error);
    }
  };

  return {
    handleCardClick,
    handleTokenClick,
  };
};

export default Movement;
