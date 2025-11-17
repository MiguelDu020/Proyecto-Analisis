/**
 * Componente para mostrar estadísticas del juego
 */

import { Move } from '../types';

interface GameStatsProps {
  moves: Move[];
  gameState: string;
  turn: number;
  policeCount: number;
  thiefCount: number;
}

export function GameStats({ moves, turn, policeCount, thiefCount }: GameStatsProps) {
  const totalMoves = moves.length;
  const policeMoves = moves.filter(m => m.pieceId.startsWith('police')).length;
  const thiefMoves = moves.filter(m => m.pieceId.startsWith('thief')).length;
  
  // Calcular movimientos promedio por turno
  const avgMovesPerTurn = turn > 0 ? (totalMoves / turn).toFixed(1) : '0';

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Estadísticas</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Turno Actual</div>
          <div className="text-xl font-bold text-blue-700">{turn}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Total Movimientos</div>
          <div className="text-xl font-bold text-green-700">{totalMoves}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Mov. Policías</div>
          <div className="text-lg font-semibold text-blue-600">{policeMoves}</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Mov. Ladrones</div>
          <div className="text-lg font-semibold text-red-600">{thiefMoves}</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Policías en juego:</span>
            <span className="font-semibold">{policeCount}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Ladrones en juego:</span>
            <span className="font-semibold">{thiefCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Promedio mov/turno:</span>
            <span className="font-semibold">{avgMovesPerTurn}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

