/**
 * Componente para mostrar el registro de movimientos (bitácora)
 */

import { Move } from '../types';

interface MoveLogProps {
  moves: Move[];
}

export function MoveLog({ moves }: MoveLogProps) {
  // Agrupar movimientos por turno
  const movesByTurn = new Map<number, { police: Move[]; thieves: Move[] }>();
  
  moves.forEach(move => {
    if (!movesByTurn.has(move.turn)) {
      movesByTurn.set(move.turn, { police: [], thieves: [] });
    }
    const turnData = movesByTurn.get(move.turn)!;
    if (move.pieceId.startsWith('police')) {
      turnData.police.push(move);
    } else {
      turnData.thieves.push(move);
    }
  });

  // Convertir a array y ordenar por turno - MOSTRAR TODOS LOS TURNOS
  const turns = Array.from(movesByTurn.entries())
    .sort((a, b) => b[0] - a[0]); // Ordenar descendente (más recientes primero)

  const formatMove = (move: Move): string => {
    const pieceName = move.pieceId.startsWith('thief') 
      ? `Ladrón ${move.pieceId.split('-')[1] || '0'}`
      : `Policía ${move.pieceId.split('-')[1] || '0'}`;
    return `${pieceName} → (${move.to.row},${move.to.col})`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col" style={{ maxHeight: '600px' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Bitácora de Movimientos</h3>
        {turns.length > 0 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {turns.length} turno{turns.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2" style={{ maxHeight: '500px' }}>
        {turns.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No hay movimientos registrados aún.</p>
        ) : (
          turns.map(([turn, turnMoves]) => {
            const hasPolice = turnMoves.police.length > 0;
            const hasThieves = turnMoves.thieves.length > 0;

            return (
              <div
                key={turn}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3"
              >
                {/* Encabezado del Turno */}
                <div className="font-bold text-base text-gray-800 pb-2 border-b border-gray-300">
                  Turno {turn}
                </div>
                
                {/* Sección de Movimientos del Ladrón */}
                {hasThieves && (
                  <div>
                    <div className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                      <span>🏃</span>
                      <span>Movimientos del Ladrón</span>
                    </div>
                    <div className="text-xs text-gray-700 ml-5 space-y-1">
                      {turnMoves.thieves.map((move, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <span>{formatMove(move)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sección de Movimientos de Policías */}
                {hasPolice && (
                  <div>
                    <div className="text-sm font-semibold text-blue-600 mb-2 flex items-center gap-1">
                      <span>👮</span>
                      <span>Movimientos de Policías</span>
                    </div>
                    <div className="text-xs text-gray-700 ml-5 space-y-1">
                      {turnMoves.police.map((move, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <span>{formatMove(move)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
