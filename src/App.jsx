import React, { useState, useEffect } from 'react';
import ButtonsPage from './components/buttonspage';
import CreateFormPage from './components/createformpage';
import './App.css';
import './components/buttons.css';
import './components/form.css';

function App() {
  const [currentFrame, setCurrentFrame] = useState('initial');  // Controla en qué "frame" estamos

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentFrame('buttons');  // Después de 5 segundos, muestra los botones
    }, 5000);

    return () => clearTimeout(timer);  // Limpia el temporizador cuando se desmonta
  }, []);

  // Función para cambiar al frame del formulario
  const handleCreateGame = () => {
    setCurrentFrame('form');
  };

  return (
    <div className={`App ${currentFrame === 'initial' ? 'frame4' : 'frame0'}`}>
      {currentFrame === 'buttons' && (
        <ButtonsPage onCreateGame={handleCreateGame} />
      )}
      {currentFrame === 'form' && (
        <CreateFormPage />
      )}
    </div>
  );
}

export default App;
