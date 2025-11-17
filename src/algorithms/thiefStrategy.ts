/**
 * Estrategias para el movimiento del ladrón
 */

import { Position, BoardSize, GamePiece, ThiefMode } from '../types';
import { getDiagonalMoves, hasThiefReachedBottom } from '../utils/boardUtils';

/**
 * Calcula el mejor movimiento para el ladrón según el modo
 */
export function calculateThiefMove(
  thief: GamePiece,
  police: GamePiece[],
  boardSize: BoardSize,
  mode: ThiefMode,
  allThieves?: GamePiece[] // Todos los ladrones para evitar colisiones
): Position | null {
  if (mode === 'random') {
    return randomThiefMove(thief, police, boardSize, allThieves || []);
  } else {
    // Modo manual - no debería llamarse aquí, pero por si acaso
    return randomThiefMove(thief, police, boardSize, allThieves || []);
  }
}

/**
 * Movimiento aleatorio del ladrón
 * Complejidad: O(1) - máximo 4 movimientos posibles
 */
function randomThiefMove(
  thief: GamePiece,
  police: GamePiece[],
  boardSize: BoardSize,
  allThieves: GamePiece[] = []
): Position | null {
  const moves = getDiagonalMoves(thief.position, boardSize, false);
  const occupiedPositions = new Set<string>();
  
  // Agregar posiciones ocupadas por policías
  police.forEach((p) => {
    occupiedPositions.add(`${p.position.row},${p.position.col}`);
  });
  
  // Agregar posiciones ocupadas por otros ladrones
  allThieves.forEach((t) => {
    if (t.id !== thief.id) {
      occupiedPositions.add(`${t.position.row},${t.position.col}`);
    }
  });

  // Filtrar movimientos válidos (no ocupados por policías ni otros ladrones)
  const validMoves = moves.filter((move) => {
    const key = `${move.row},${move.col}`;
    return !occupiedPositions.has(key);
  });

  if (validMoves.length === 0) return null;

  // Mejorar aleatoriedad: usar una mejor función de selección aleatoria
  // Mezclar el array antes de seleccionar para mayor aleatoriedad
  const shuffled = [...validMoves].sort(() => Math.random() - 0.5);
  const randomIndex = Math.floor(Math.random() * shuffled.length);
  return shuffled[randomIndex];
}


/**
 * Estrategia de escape: intenta maximizar la distancia a los policías
 * Complejidad: O(M * P) donde M es el número de movimientos y P el número de policías
 */
export function escapeStrategy(
  thief: GamePiece,
  police: GamePiece[],
  boardSize: BoardSize
): Position | null {
  const moves = getDiagonalMoves(thief.position, boardSize, false);
  const policePositions = new Set(
    police.map((p) => `${p.position.row},${p.position.col}`)
  );

  const validMoves = moves.filter((move) => {
    const key = `${move.row},${move.col}`;
    return !policePositions.has(key);
  });

  if (validMoves.length === 0) return null;

  // Si el ladrón puede llegar al borde inferior, hacerlo (prioridad máxima)
  for (const move of validMoves) {
    if (hasThiefReachedBottom(move, boardSize)) {
      return move;
    }
  }

  // Calcular distancia mínima a policías para cada movimiento usando Manhattan
  let bestMove: Position | null = null;
  let bestScore = -Infinity;

  for (const move of validMoves) {
    // Calcular distancia mínima a cualquier policía usando Manhattan (más rápido)
    let minDist = Infinity;
    let totalDist = 0;
    
    for (const cop of police) {
      const manhattanDist = Math.abs(move.row - cop.position.row) + Math.abs(move.col - cop.position.col);
      minDist = Math.min(minDist, manhattanDist);
      totalDist += manhattanDist;
    }

    // Score: priorizar distancia mínima alta y distancia total alta
    // También considerar distancia al borde inferior
    const distanceToBottom = boardSize - 1 - move.row;
    const score = minDist * 3 + totalDist + distanceToBottom * 2;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

