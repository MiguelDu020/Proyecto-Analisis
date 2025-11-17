/**
 * Utilidades para el tablero
 */

import { Position, BoardSize } from '../types';

/**
 * Verifica si una posición está dentro de los límites del tablero
 */
export function isValidPosition(pos: Position, boardSize: BoardSize): boolean {
  return pos.row >= 0 && pos.row < boardSize && pos.col >= 0 && pos.col < boardSize;
}

/**
 * Verifica si una casilla es blanca (basado en patrón de ajedrez)
 */
export function isWhiteSquare(pos: Position): boolean {
  return (pos.row + pos.col) % 2 === 0;
}

/**
 * Calcula la distancia de Manhattan entre dos posiciones
 */
export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Calcula la distancia euclidiana entre dos posiciones
 */
export function euclideanDistance(a: Position, b: Position): number {
  const dr = a.row - b.row;
  const dc = a.col - b.col;
  return Math.sqrt(dr * dr + dc * dc);
}

/**
 * Obtiene todas las posiciones válidas para movimiento diagonal
 */
export function getDiagonalMoves(
  pos: Position,
  boardSize: BoardSize,
  forwardOnly: boolean = false
): Position[] {
  const moves: Position[] = [];
  const directions = forwardOnly
    ? [
        { row: -1, col: -1 }, // Diagonal adelante izquierda
        { row: -1, col: 1 },  // Diagonal adelante derecha
      ]
    : [
        { row: -1, col: -1 }, // Diagonal arriba izquierda
        { row: -1, col: 1 },  // Diagonal arriba derecha
        { row: 1, col: -1 },  // Diagonal abajo izquierda
        { row: 1, col: 1 },   // Diagonal abajo derecha
      ];

  for (const dir of directions) {
    const newPos: Position = {
      row: pos.row + dir.row,
      col: pos.col + dir.col,
    };
    if (isValidPosition(newPos, boardSize)) {
      moves.push(newPos);
    }
  }

  return moves;
}

/**
 * Verifica si un policía puede capturar al ladrón en el siguiente movimiento
 */
export function canCapture(
  policePos: Position,
  thiefPos: Position,
  boardSize: BoardSize
): boolean {
  const policeMoves = getDiagonalMoves(policePos, boardSize, true);
  return policeMoves.some(
    (move) => move.row === thiefPos.row && move.col === thiefPos.col
  );
}

/**
 * Verifica si el ladrón ha llegado al borde inferior (victoria del ladrón)
 */
export function hasThiefReachedBottom(
  thiefPos: Position,
  boardSize: BoardSize
): boolean {
  return thiefPos.row === boardSize - 1;
}

