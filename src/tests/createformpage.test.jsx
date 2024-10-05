import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest"; 
import { userEvent } from "@testing-library/user-event";

import CreateFormPage from "/src/components/createformpage.jsx"; 

test("It submits the form and calls onGameCreated", async () => {
  // Creamos el mock para `onGameCreated`
  const mockOnGameCreated = vi.fn();

  // Renderizamos el componente `CreateFormPage` pasando el mock como prop
  render(
    <CreateFormPage onGameCreated={mockOnGameCreated} onGoBack={() => {}} />
  );

  // Simulamos la entrada de datos en los campos del formulario
  await userEvent.type(screen.getByLabelText('Nombre de Usuario'), "Tomás");
  await userEvent.type(screen.getByLabelText('Nombre de la partida'), "Mi Partida");
  await userEvent.type(screen.getByLabelText('Máximo de jugadores'), "4");
  await userEvent.type(screen.getByLabelText('Mínimo de jugadores'), "2");

  // Simulamos el clic en el botón "Crear"
  const submitButton = screen.getByText("Crear");
  await userEvent.click(submitButton);

  // Esperamos que el `onGameCreated` haya sido llamado correctamente
  await waitFor(() => {
    expect(mockOnGameCreated).toHaveBeenCalled();
  });
});

test("It only enables submit when all fields are filled", async () => {
  const mockOnGameCreated = vi.fn();

  render(
    <CreateFormPage onGameCreated={mockOnGameCreated} onGoBack={() => {}} />
  );

  const submitButton = screen.getByText("Crear");

  // Inicialmente no debería poder hacer submit si los campos están vacíos
  await userEvent.click(submitButton);
  expect(mockOnGameCreated).not.toHaveBeenCalled();

  // Completamos los campos
  await userEvent.type(screen.getByLabelText('Nombre de Usuario'), "Tomás");
  await userEvent.type(screen.getByLabelText('Nombre de la partida'), "Mi Partida");
  await userEvent.type(screen.getByLabelText('Máximo de jugadores'), "4");
  await userEvent.type(screen.getByLabelText('Mínimo de jugadores'), "2");

  // Ahora clickeamos "Crear" y debería llamar a `onGameCreated`
  await userEvent.click(submitButton);
  await waitFor(() => {
    expect(mockOnGameCreated).toHaveBeenCalled();
  });
});
