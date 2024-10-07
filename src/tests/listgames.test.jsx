import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import ListGames from "../components/listgames";

// Mock de la API fetch
global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 1,
            name: "Partida 1",
            host_id: 123,
            in_game: false,
            is_private: false,
            users: {
              min: 2,
              max: 4,
              players: [
                { additionalProp1: "Player1" },
                { additionalProp2: "Player2" }
              ]
            }
          }
        ]),
    })
  );
  

test("It requires a user name before submitting", async () => {
  const mockOnJoinGame = vi.fn();

  // Renderizamos el componente
  render(<ListGames onBack={() => {}} onJoinGame={mockOnJoinGame} userId={1} />);

  // Verificamos que el fetch **no** se haya llamado inicialmente
  expect(global.fetch).not.toHaveBeenCalled();

  // Simulamos el ingreso del nombre de usuario
  await userEvent.type(screen.getByPlaceholderText("Nombre de usuario"), "Nacho");

  // Simulamos clic en el botón "Continuar"
  await userEvent.click(screen.getByText("Continuar"));

  // Verificamos que ahora sí se haya llamado a `fetch` después de enviar el formulario
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});


// test("It allows a user to join a game", async () => {
//     const mockOnJoinGame = vi.fn(); // Mock para la función onJoinGame
  
//     // Renderizamos el componente
//     render(<ListGames onBack={() => {}} onJoinGame={mockOnJoinGame} userId={1} />);
  
//     // Simulamos el ingreso del nombre de usuario
//     await userEvent.type(screen.getByPlaceholderText("Nombre de usuario"), "Nacho");
  
//     // Simulamos clic en el botón "Continuar"
//     await userEvent.click(screen.getByText("Continuar"));
  
//     // Esperamos a que las partidas se carguen
//     await waitFor(() => {
//       expect(screen.getByText("Partida 1")).toBeInTheDocument();
//     });
  
//     // Selecciona el botón "Unirse" y haz clic
//     const joinButtons = screen.getAllByText("Unirse");
//     expect(joinButtons.length).toBeGreaterThan(0); // Asegúrate de que los botones existen
//     expect(joinButtons[0]).toBeEnabled(); // Verifica que el botón está habilitado
//     await userEvent.click(joinButtons[0]); // Haz clic en el primer botón
  
//     // Verifica si `onJoinGame` fue llamado
//     await waitFor(() => {
//       expect(mockOnJoinGame).toHaveBeenCalled(); // Verifica que fue llamado sin importar los argumentos
//     });
//   });
  
  