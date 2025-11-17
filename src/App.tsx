/**
 * Componente principal de la aplicación
 */

import { useState, useEffect, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { Board } from './components/Board';
import { GameControls } from './components/GameControls';
import { MoveLog } from './components/MoveLog';
import { VictoryModal } from './components/VictoryModal';
import { GameStats } from './components/GameStats';
import { GameConfig, Position } from './types';

const DEFAULT_CONFIG: GameConfig = {
  boardSize: 8,
  policeCount: 4,
  thiefCount: 1,
  thiefMode: 'random',
  showAnimations: true,
  cellSize: 'medium',
  colorScheme: 'default',
};

// Velocidad predeterminada de simulación (milisegundos)
const DEFAULT_SIMULATION_SPEED = 800;

function App() {
  const [game] = useState(() => {
    const newGame = new GameEngine(DEFAULT_CONFIG);
    newGame.initializeGame(); // Inicializar el juego para que las piezas se vean desde el inicio
    return newGame;
  });
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState(game.getStatus());
  const [pieces, setPieces] = useState(game.getPieces());
  const [selectedThiefId, setSelectedThiefId] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(DEFAULT_SIMULATION_SPEED);
  const [stepByStep, setStepByStep] = useState(false);

  // Actualizar estado del juego
  const updateGameState = useCallback(() => {
    const newStatus = game.getStatus();
    setStatus(newStatus);
    setPieces(game.getPieces());
    
    // Mostrar modal de victoria si el juego terminó
    if (newStatus.state === 'thief-won' || newStatus.state === 'police-won') {
      setShowVictoryModal(true);
    }
  }, [game]);

  // Manejar cambio de configuración
  const handleConfigChange = useCallback((newConfig: Partial<GameConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    game.updateConfig(updatedConfig);
    updateGameState();
    setSelectedThiefId(null);
    setValidMoves([]);
    setAutoPlay(false);
  }, [config, game, updateGameState]);

  // Iniciar juego
  const handleStart = useCallback(() => {
    game.start();
    updateGameState();
    if (config.thiefMode !== 'manual') {
      setAutoPlay(true);
    }
  }, [game, updateGameState, config.thiefMode]);

  // Manejar clic en celda del tablero
  const handleCellClick = useCallback((position: Position) => {
    if (status.state !== 'playing' || status.currentPlayer !== 'thief') {
      return;
    }

    if (config.thiefMode === 'manual') {
      // Si hay un ladrón seleccionado, intentar mover
      if (selectedThiefId) {
        const isValidMove = validMoves.some(
          (move) => move.row === position.row && move.col === position.col
        );

        if (isValidMove) {
          const success = game.makeThiefMove(selectedThiefId, position);
          if (success) {
            updateGameState();
            setSelectedThiefId(null);
            setValidMoves([]);
            
            // Verificar el estado después del movimiento
            const newStatus = game.getStatus();
            
            // Verificar si el juego terminó
            if (newStatus.state !== 'playing') {
              return; // El juego terminó
            }
            
            // Si el turno cambió a policías, moverlos automáticamente
            if (newStatus.currentPlayer === 'police') {
              // Pequeño delay para que el usuario vea el movimiento del ladrón
              setTimeout(() => {
                const currentStatus = game.getStatus();
                if (currentStatus.state === 'playing' && currentStatus.currentPlayer === 'police') {
                  game.makePoliceMove();
                  updateGameState();
                }
              }, 300); // Delay más corto para mejor UX
            }
          }
        } else {
          // Si se hace clic en otro ladrón, seleccionarlo
          const clickedThief = pieces.thieves.find(
            t => t.position.row === position.row && t.position.col === position.col
          );
          if (clickedThief) {
            const moves = game.getValidThiefMoves(clickedThief.id);
            // Verificar si el ladrón tiene movimientos válidos
            if (moves.length === 0) {
              // Verificar si todos los ladrones están bloqueados
              const allBlocked = pieces.thieves.every(t => {
                const thiefMoves = game.getValidThiefMoves(t.id);
                return thiefMoves.length === 0;
              });
              if (allBlocked) {
                // Forzar verificación en el GameEngine
                const currentStatus = game.getStatus();
                if (currentStatus.state === 'playing') {
                  // El GameEngine debería detectar esto, pero por si acaso forzamos
                  setTimeout(() => {
                    updateGameState();
                  }, 100);
                }
              }
            }
            setSelectedThiefId(clickedThief.id);
            setValidMoves(moves);
          } else {
            setSelectedThiefId(null);
            setValidMoves([]);
          }
        }
      } else {
        // Seleccionar un ladrón
        const clickedThief = pieces.thieves.find(
          t => t.position.row === position.row && t.position.col === position.col
        );
        if (clickedThief) {
          setSelectedThiefId(clickedThief.id);
          setValidMoves(game.getValidThiefMoves(clickedThief.id));
        }
      }
    }
  }, [status, config, selectedThiefId, validMoves, pieces, game, updateGameState]);

  // Auto-play para modo automático (solo si no está en paso a paso)
  useEffect(() => {
    if (autoPlay && !stepByStep && status.state === 'playing' && config.thiefMode !== 'manual') {
      const interval = setInterval(() => {
        // Obtener el estado actual del juego (puede haber cambiado)
        const currentStatus = game.getStatus();
        const currentPieces = game.getPieces();
        
        if (currentStatus.state === 'playing' && currentStatus.currentPlayer === 'thief') {
          // Mover todos los ladrones
          let allMoved = true;
          for (const thief of currentPieces.thieves) {
            const success = game.makeThiefMove(thief.id);
            if (!success) {
              allMoved = false;
            }
          }
          
          if (allMoved) {
            updateGameState();
            
            // Mover policías después de un breve delay
            setTimeout(() => {
              const afterThiefStatus = game.getStatus();
              if (afterThiefStatus.state === 'playing' && afterThiefStatus.currentPlayer === 'police') {
                game.makePoliceMove();
                updateGameState();
              }
            }, simulationSpeed);
          } else {
            // Si algún ladrón no pudo moverse, puede estar bloqueado
            updateGameState();
            setAutoPlay(false);
          }
        }
      }, simulationSpeed);

      return () => clearInterval(interval);
    }
  }, [autoPlay, stepByStep, status.state, config.thiefMode, simulationSpeed, game, updateGameState]);

  // Iniciar auto-play cuando cambia a modo automático
  useEffect(() => {
    if (config.thiefMode !== 'manual' && status.state === 'playing' && !stepByStep) {
      setAutoPlay(true);
    } else {
      setAutoPlay(false);
    }
  }, [config.thiefMode, status.state, stepByStep]);

  // Manejar reinicio
  const handleReset = useCallback(() => {
    game.reset();
    setShowVictoryModal(false);
    updateGameState();
    setSelectedThiefId(null);
    setValidMoves([]);
    setAutoPlay(false);
  }, [game, updateGameState]);

  // Manejar pausa
  const handlePause = useCallback(() => {
    game.setPaused(true);
    updateGameState();
    setAutoPlay(false);
  }, [game, updateGameState]);

  // Manejar reanudar
  const handleResume = useCallback(() => {
    game.setPaused(false);
    updateGameState();
    if (config.thiefMode !== 'manual' && !stepByStep) {
      setAutoPlay(true);
    }
  }, [game, updateGameState, config.thiefMode, stepByStep]);

  // Manejar paso a paso
  const handleStep = useCallback(() => {
    if (status.state === 'playing') {
      const currentStatus = game.getStatus();
      if (currentStatus.currentPlayer === 'thief' && config.thiefMode !== 'manual') {
        // Mover todos los ladrones
        const currentPieces = game.getPieces();
        for (const thief of currentPieces.thieves) {
          game.makeThiefMove(thief.id);
        }
        updateGameState();
        
        // Después de que los ladrones mueven, mover policías
        setTimeout(() => {
          const afterThiefStatus = game.getStatus();
          if (afterThiefStatus.state === 'playing' && afterThiefStatus.currentPlayer === 'police') {
            game.makePoliceMove();
            updateGameState();
          }
        }, 300);
      } else if (currentStatus.currentPlayer === 'police') {
        game.makePoliceMove();
        updateGameState();
      }
    }
  }, [status.state, config.thiefMode, game, updateGameState]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎮 Policías y Ladrón
          </h1>
          <p className="text-gray-600">
            Proyecto de Análisis de Algoritmos - BFS, Heurísticas y Estrategias
          </p>
        </header>

        {/* Modal de Victoria */}
        {status.result && (
          <VictoryModal
            isOpen={showVictoryModal}
            winner={status.result.winner}
            message={status.result.message}
            onClose={() => setShowVictoryModal(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tablero y Controles */}
          <div className="lg:col-span-2 space-y-6">
            <Board
              size={config.boardSize}
              police={pieces.police}
              thieves={pieces.thieves}
              onCellClick={handleCellClick}
              selectedThiefId={selectedThiefId}
              validMoves={validMoves}
              cellSize={config.cellSize}
              colorScheme={config.colorScheme}
              showAnimations={config.showAnimations}
            />
            <GameControls
              gameState={status.state}
              currentPlayer={status.currentPlayer}
              turn={status.turn}
              onReset={handleReset}
              onPause={handlePause}
              onResume={handleResume}
              onStart={handleStart}
              onStep={handleStep}
              config={config}
              onConfigChange={handleConfigChange}
              simulationSpeed={simulationSpeed}
              onSimulationSpeedChange={setSimulationSpeed}
              stepByStep={stepByStep}
              onStepByStepChange={setStepByStep}
            />
          </div>

          {/* Bitácora y Estadísticas */}
          <div className="lg:col-span-1 space-y-6">
            <GameStats
              moves={status.moves}
              gameState={status.state}
              turn={status.turn}
              policeCount={pieces.police.length}
              thiefCount={pieces.thieves.length}
            />
            <MoveLog moves={status.moves} />
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📖 Instrucciones del Juego</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🎮 Modo Manual:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                  <li>Haz clic en un ladrón para seleccionarlo</li>
                  <li>Las casillas verdes muestran movimientos válidos</li>
                  <li>Haz clic en una casilla verde para mover el ladrón</li>
                  <li>Los policías se mueven automáticamente después de tu turno</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🎲 Modo Aleatorio:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                  <li>El ladrón se mueve aleatoriamente en cada turno</li>
                  <li>Los policías usan una estrategia inteligente para capturarlo</li>
                  <li>El juego se ejecuta automáticamente</li>
                  <li>Puedes ajustar la velocidad de simulación</li>
                  <li>Activa "Modo Paso a Paso" para avanzar manualmente</li>
                </ul>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">⚙️ Controles:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                  <li><strong>Iniciar:</strong> Comienza el juego</li>
                  <li><strong>Pausar/Continuar:</strong> Controla la ejecución</li>
                  <li><strong>Paso a Paso:</strong> Avanza un turno completo (solo en modo automático)</li>
                  <li><strong>Reiniciar:</strong> Vuelve a empezar el juego</li>
                  <li><strong>Velocidad:</strong> Ajusta la rapidez de la simulación (200ms - 2000ms)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🎯 Objetivo:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                  <li><strong>Policías:</strong> Capturar al ladrón antes de que llegue al borde inferior</li>
                  <li><strong>Ladrón:</strong> Llegar al borde inferior del tablero sin ser capturado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
