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
        //algo que diga que primero deseleccione tokens o termine el movimiento
    }
  };

  // Función para seleccionar una ficha
  const handleTokenClick = (tokenId) => {
    if (!selectedCard) {
      return;
    }

    if (selectedTokens.includes(tokenId)) {
      return;
    }

    if (selectedTokens.length < 2) {
      setSelectedTokens((prev) => [...prev, tokenId]);
    }

    // Si ya hay dos fichas seleccionadas, proceder al movimiento
    if (selectedTokens.length === 1) {
      executeMove(selectedCard.id, selectedTokens[0], tokenId);
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
      alert('Movimiento ejecutado con éxito');
      setSelectedCard(null);
      setSelectedTokens([]);
      onMoveCompleted(); // Notificar al Board que el movimiento fue completado
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
