/**
 * Heurísticas para evaluar posiciones y movimientos
 */

import { Position, BoardSize, GamePiece } from '../types';
import { manhattanDistance, euclideanDistance, bfsDistance } from './bfs';
import { getDiagonalMoves } from '../utils/boardUtils';

/**
 * Heurística 1: Distancia mínima de cualquier policía al ladrón
 * Complejidad: O(P) donde P es el número de policías
 */
export function minPoliceDistance(
  police: GamePiece[],
  thief: GamePiece,
  boardSize: BoardSize
): number {
  let minDist = Infinity;
  for (const cop of police) {
    const dist = bfsDistance(cop.position, thief.position, boardSize, true);
    minDist = Math.min(minDist, dist);
  }
  return minDist;
}

/**
 * Heurística 2: Suma de distancias de todos los policías al ladrón
 * Complejidad: O(P) donde P es el número de policías
 */
export function totalPoliceDistance(
  police: GamePiece[],
  thief: GamePiece,
  boardSize: BoardSize
): number {
  let total = 0;
  for (const cop of police) {
    total += bfsDistance(cop.position, thief.position, boardSize, true);
  }
  return total;
}

/**
 * Heurística 3: Distancia del ladrón al borde inferior (objetivo del ladrón)
 * Complejidad: O(1)
 */
export function thiefDistanceToBottom(
  thief: GamePiece,
  boardSize: BoardSize
): number {
  return boardSize - 1 - thief.position.row;
}

/**
 * Heurística 4: Número de movimientos de escape disponibles para el ladrón
 * Complejidad: O(1) - máximo 4 movimientos diagonales
 */
export function thiefEscapeMoves(
  thief: GamePiece,
  police: GamePiece[],
  boardSize: BoardSize
): number {
  const moves = getDiagonalMoves(thief.position, boardSize, false);
  const policePositions = new Set(
    police.map((p) => `${p.position.row},${p.position.col}`)
  );

  return moves.filter((move) => {
    const key = `${move.row},${move.col}`;
    return !policePositions.has(key);
  }).length;
}

/**
 * Heurística 5: Evaluación combinada para los policías
 * Valor más bajo = mejor posición para los policías
 */
export function policeHeuristic(
  police: GamePiece[],
  thief: GamePiece,
  boardSize: BoardSize
): number {
  const minDist = minPoliceDistance(police, thief, boardSize);
  const thiefToBottom = thiefDistanceToBottom(thief, boardSize);
  const escapeMoves = thiefEscapeMoves(thief, police, boardSize);

  // Penalizar si el ladrón está cerca del borde inferior
  const bottomPenalty = thiefToBottom < 3 ? (3 - thiefToBottom) * 10 : 0;

  // Penalizar si el ladrón tiene muchos movimientos de escape
  const escapePenalty = escapeMoves * 2;

  return minDist + bottomPenalty + escapePenalty;
}

/**
 * Heurística 6: Evaluación para el ladrón
 * Valor más alto = mejor posición para el ladrón
 */
export function thiefHeuristic(
  thief: GamePiece,
  police: GamePiece[],
  boardSize: BoardSize
): number {
  const toBottom = thiefDistanceToBottom(thief, boardSize);
  const minDist = minPoliceDistance(police, thief, boardSize);
  const escapeMoves = thiefEscapeMoves(thief, police, boardSize);

  // Recompensa por estar cerca del borde inferior
  const bottomReward = (boardSize - toBottom) * 10;

  // Recompensa por tener distancia de los policías
  const distanceReward = minDist * 3;

  // Recompensa por tener opciones de escape
  const escapeReward = escapeMoves * 5;

  return bottomReward + distanceReward + escapeReward;
}

