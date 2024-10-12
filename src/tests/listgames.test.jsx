import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import ListGames from "../components/listgames";

// Mock de la API fetch
beforeEach (() => {
  vi.clearAllMocks();

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
});

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
//     // Mock para la función onJoinGame
//     const mockOnJoinGame = vi.fn();

//     // Renderizamos el componente `ListGames`
//     render(<ListGames onBack={() => {}} onJoinGame={mockOnJoinGame} userId={1} />);

//     // Paso 1: Simular ingreso del nombre de usuario
//     const userNameInput = screen.getByPlaceholderText("Nombre de usuario");
//     await userEvent.type(userNameInput, "Nacho");

//     // Paso 2: Simular clic en el botón "Continuar"
//     const continueButton = screen.getByText("Continuar");
//     await userEvent.click(continueButton);

//     // Paso 3: Esperar a que las partidas se carguen y verificar que aparece "Partida 1"
//     await waitFor(() => {
//         expect(screen.getByText("Partida 1")).toBeInTheDocument();
//     });

//     // Paso 4: Seleccionar el botón "Unirse" correspondiente a "Partida 1"
//     const joinButtons = screen.getAllByText("Unirse");
//     expect(joinButtons.length).toBeGreaterThan(0); // Asegurarse de que existen botones de "Unirse"

//     const firstJoinButton = joinButtons[0];
//     expect(firstJoinButton).toBeEnabled(); // Verificar que el botón está habilitado

//     // Paso 5: Simular clic en el primer botón "Unirse"
//     await userEvent.click(firstJoinButton);

//     // Paso 6: Verificar que `onJoinGame` fue llamado después de hacer clic en "Unirse"
//     await waitFor(() => {
//         expect(mockOnJoinGame).toHaveBeenCalled(); // Verificar que fue llamado sin importar los argumentos
//     });
// });

  
  