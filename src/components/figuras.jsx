import React, { useEffect, useState } from 'react';

const Figuras = ({ gameId, onFiguresFetched, triggerFetch, onFigureSelected }) => {
  const [error, setError] = useState(null);
  const [figures, setFigures] = useState([]); 

  // Función para obtener todas las figuras desde el backend
  const fetchFigures = async () => {
    try {
      const response = await fetch(`http://localhost:8000/game/${gameId}/show_all_figures`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener las figuras');
      }
      const data = await response.json();
      setFigures(data.figures || []); // Guardamos las figuras en el estado
      onFiguresFetched(data.figures || []); // Pasamos las figuras obtenidas al padre
      console.log('FIGURAS OBTENIDAS');

    } catch (err) {
      setError(err.message);
      console.error('Error al obtener las figuras:', err);
    }
  };

  useEffect(() => {
     fetchFigures();
   }, [gameId, triggerFetch]);


  // No necesitas renderizado en este componente, todo lo que haces es lógica de obtención de datos.
  return null
};
export default Figuras;
