/**
 * Componente de controles del juego
 */

import { GameState, BoardSize, ThiefMode, GameConfig } from '../types';

interface GameControlsProps {
  gameState: GameState;
  currentPlayer: 'thief' | 'police';
  turn: number;
  onReset: () => void;
  onPause: () => void;
  onResume: () => void;
  onStart: () => void;
  onStep?: () => void;
  config: GameConfig;
  onConfigChange: (config: Partial<GameConfig>) => void;
  simulationSpeed: number;
  onSimulationSpeedChange: (speed: number) => void;
  stepByStep: boolean;
  onStepByStepChange: (enabled: boolean) => void;
}

// Opciones predefinidas para número de policías según tamaño del tablero
const getPoliceOptions = (boardSize: BoardSize): number[] => {
  if (boardSize === 8) {
    return [1, 2, 3, 4]; // Opciones viables para 8x8
  } else {
    return [2, 3, 4, 5, 6]; // Opciones viables para 16x16
  }
};

// Opciones predefinidas para número de ladrones según tamaño del tablero
const getThiefOptions = (boardSize: BoardSize): number[] => {
  if (boardSize === 8) {
    return [1, 2]; // Opciones viables para 8x8
  } else {
    return [1, 2, 3]; // Opciones viables para 16x16
  }
};

export function GameControls({
  gameState,
  currentPlayer,
  turn,
  onReset,
  onPause,
  onResume,
  onStart,
  onStep,
  config,
  onConfigChange,
  simulationSpeed,
  onSimulationSpeedChange,
  stepByStep,
  onStepByStepChange,
}: GameControlsProps) {
  const isPlaying = gameState === 'playing';
  const isPaused = gameState === 'paused';
  const isNotStarted = gameState === 'not-started';

  const policeOptions = getPoliceOptions(config.boardSize);
  const thiefOptions = getThiefOptions(config.boardSize);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Controles</h2>
        <div className="text-sm text-gray-600">
          Turno: <span className="font-bold">{turn}</span>
        </div>
      </div>

      {/* Botones principales */}
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {isNotStarted && (
            <button
              onClick={onStart}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Iniciar
            </button>
          )}
          {isPlaying && !stepByStep && (
            <button
              onClick={onPause}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Pausar
            </button>
          )}
          {isPaused && (
            <button
              onClick={onResume}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Continuar
            </button>
          )}
          {isPlaying && config.thiefMode !== 'manual' && onStep && (
            <button
              onClick={onStep}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Paso a Paso
            </button>
          )}
          <button
            onClick={onReset}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Reiniciar
          </button>
        </div>

        {/* Configuración del juego */}
        <div className="border-t pt-3 space-y-3">
          <h3 className="font-semibold text-gray-700">Configuración del Juego</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Tamaño del Tablero
            </label>
            <select
              value={config.boardSize}
              onChange={(e) => {
                const newSize = Number(e.target.value) as BoardSize;
                onConfigChange({ boardSize: newSize });
                // Ajustar número de policías y ladrones según el nuevo tamaño
                const newPoliceOptions = getPoliceOptions(newSize);
                const newThiefOptions = getThiefOptions(newSize);
                if (!newPoliceOptions.includes(config.policeCount)) {
                  onConfigChange({ policeCount: newPoliceOptions[0] });
                }
                if (!newThiefOptions.includes(config.thiefCount)) {
                  onConfigChange({ thiefCount: newThiefOptions[0] });
                }
              }}
              disabled={isPlaying}
              className="w-full border-2 border-gray-300 bg-white text-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={8}>8×8</option>
              <option value={16}>16×16</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Número de Policías
            </label>
            <select
              value={config.policeCount}
              onChange={(e) =>
                onConfigChange({ policeCount: Number(e.target.value) })
              }
              disabled={isPlaying}
              className="w-full border-2 border-gray-300 bg-white text-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {policeOptions.map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Número de Ladrones
            </label>
            <select
              value={config.thiefCount}
              onChange={(e) =>
                onConfigChange({ thiefCount: Number(e.target.value) })
              }
              disabled={isPlaying}
              className="w-full border-2 border-gray-300 bg-white text-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {thiefOptions.map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Modo del Ladrón
            </label>
            <select
              value={config.thiefMode}
              onChange={(e) =>
                onConfigChange({ thiefMode: e.target.value as ThiefMode })
              }
              disabled={isPlaying}
              className="w-full border-2 border-gray-300 bg-white text-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="manual">Manual</option>
              <option value="random">Aleatorio</option>
            </select>
          </div>
        </div>

        {/* Controles de simulación (solo en modo automático) */}
        {config.thiefMode !== 'manual' && (
          <div className="border-t pt-3 space-y-3">
            <h3 className="font-semibold text-gray-700">Controles de Simulación</h3>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="stepByStep"
                checked={stepByStep}
                onChange={(e) => {
                  onStepByStepChange(e.target.checked);
                  if (e.target.checked) {
                    // Desactivar auto-play cuando se activa paso a paso
                  }
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="stepByStep" className="text-sm font-medium text-gray-700">
                Modo Paso a Paso
              </label>
            </div>

            {!stepByStep && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Velocidad de Simulación: {simulationSpeed}ms
                </label>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="100"
                  value={simulationSpeed}
                  onChange={(e) => onSimulationSpeedChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Rápido</span>
                  <span>Lento</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estado del juego */}
        <div className="border-t pt-3">
          <div className="text-sm">
            <div className="font-semibold text-gray-700 mb-1">Estado del Juego:</div>
            <div className="text-gray-600">
              {gameState === 'not-started' && (
                <span className="text-gray-500">Juego no iniciado</span>
              )}
              {gameState === 'playing' && (
                <span>
                  Jugando - Turno de:{' '}
                  <span className="font-bold">
                    {currentPlayer === 'thief' ? 'Ladrón 🏃' : 'Policías 👮'}
                  </span>
                </span>
              )}
              {gameState === 'thief-won' && (
                <span className="text-red-600 font-bold">¡El Ladrón Ganó! 🏃</span>
              )}
              {gameState === 'police-won' && (
                <span className="text-blue-600 font-bold">¡Los Policías Ganaron! 👮</span>
              )}
              {gameState === 'paused' && (
                <span className="text-yellow-600 font-bold">Juego Pausado</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
