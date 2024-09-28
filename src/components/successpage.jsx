import React, { useEffect } from 'react';

const SuccessPage = ({ onGoToBoard }) => {
  useEffect(() => {
    // Después de 3 segundos, ir a la página del tablero
    const timer = setTimeout(() => {
      onGoToBoard();
    }, 3000);

    return () => clearTimeout(timer);  // Limpia el temporizador al desmontar
  }, [onGoToBoard]);

  return (
    <div className="success-container">
      <h1>Partida creada con éxito</h1>
    </div>
  );
};

export default SuccessPage;