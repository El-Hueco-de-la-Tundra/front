import React, { useState, useEffect } from 'react';
import ButtonsPage from './components/buttonspage';
import CreateFormPage from './components/createformpage';
import './App.css';
import './components/buttons.css';
import './components/form.css';

function App() {
  const [currentFrame, setCurrentFrame] = useState('initial');  // Controla en qué "frame" estamos
  const [fade, setFade] = useState(false); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);  // Inicia el fade de frame4
      setTimeout(() => {
        setCurrentFrame('buttons');  // Cambia al frame de botones
        setFade(false);
      }, 1000);  // Espera 1 segundo para la transición
    }, 2500);  // Espera 5 segundos antes de iniciar la transición

    return () => clearTimeout(timer);  // Limpia el temporizador al desmontar
  }, []);
  // Función para cambiar al frame del formulario
  const handleCreateGame = () => {
    setCurrentFrame('form');
  };

  const handleGoBack = () => {
    setCurrentFrame('buttons');  // Volver al frame de los botones
  };

  return (
    <div className={`App ${currentFrame === 'initial' ? 'frame4' : 'frame0'} ${fade ? 'fade-out' : 'fade-in'}`}>
      {currentFrame === 'buttons' && (
        <ButtonsPage onCreateGame={handleCreateGame} />
      )}
      {currentFrame === 'form' && (
        <CreateFormPage onGoBack={handleGoBack} /> 
      )}
    </div>
  );
}

export default App;
