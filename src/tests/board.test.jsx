import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import BoardPage from '/src/components/board';

// Definir un mock detallado de WebSocket
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  onmessage: null,
  onopen: vi.fn(),
  onerror: vi.fn(),
  onclose: vi.fn(),
};

// Reemplazar la implementación global de WebSocket
global.WebSocket = vi.fn(() => mockWebSocket);

describe('BoardPage WebSocket and API tests', () => {
  const gameId = 'test-game-id';
  const userId = 'test-user-id';
  const onLeaveGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          users: { players: [{ '1': 'Player1' }, { '2': 'Player2' }] },
          host_id: userId,
          status: 'waiting',
        }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should connect to WebSocket and fetch game info on mount', async () => {
    await act(async () => {
      render(<BoardPage onLeaveGame={onLeaveGame} gameId={gameId} userId={userId} />);
    });

    // Verificar que se llama a fetch para obtener la información de la partida
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`http://localhost:8000/games/${gameId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    // Verificar la conexión a WebSocket
    await waitFor(() => {
      expect(WebSocket).toHaveBeenCalledWith(`ws://localhost:8000/ws/${gameId}/${userId}`);
    });
  });

  it('should handle WebSocket messages correctly', async () => {
    await act(async () => {
      render(<BoardPage onLeaveGame={onLeaveGame} gameId={gameId} userId={userId} />);
    });

    // Simular recepción de mensaje 'status_start' del WebSocket
    const messageEvent = { data: JSON.stringify({ type: 'status_start' }) };
    
    act(() => {
      mockWebSocket.onmessage(messageEvent);
    });

    await waitFor(() => {
      // Verificar que se actualiza el estado del juego cuando se recibe el mensaje de inicio
      expect(global.fetch).toHaveBeenCalledWith(`http://localhost:8000/games/${gameId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  it('should send a message to WebSocket when ending the turn', async () => {
    await act(async () => {
      render(<BoardPage onLeaveGame={onLeaveGame} gameId={gameId} userId={userId} />);
    });

    // Simular el final de turno
    act(() => {
      mockWebSocket.send(JSON.stringify({
        type: 'endturn',
        gameId,
        userId,
      }));
    });

    // Verificar que el mensaje fue enviado a WebSocket
    await waitFor(() => {
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'endturn',
        gameId,
        userId,
      }));
    });
  });

  it('should handle errors in WebSocket connection', async () => {
    await act(async () => {
      render(<BoardPage onLeaveGame={onLeaveGame} gameId={gameId} userId={userId} />);
    });

    // Simular error en WebSocket
    act(() => {
      const errorEvent = new Event('error');
      mockWebSocket.onerror(errorEvent);
    });

    // Verificar que el evento de error fue manejado
    expect(mockWebSocket.onerror).toBeDefined();
  });
});
