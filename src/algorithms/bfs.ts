/**
 * Implementación de BFS (Breadth-First Search) para encontrar caminos más cortos
 */

import { Position, BoardSize } from '../types';
import { getDiagonalMoves } from '../utils/boardUtils';

export type PathNode = {
  position: Position;
  parent: PathNode | null;
  distance: number;
};

/**
 * BFS para encontrar el camino más corto desde una posición inicial hasta una meta
 * Complejidad temporal: O(V + E) donde V es el número de vértices (casillas) y E es el número de aristas (movimientos posibles)
 * Complejidad espacial: O(V) para la cola y el conjunto de visitados
 */
export function bfsShortestPath(
  start: Position,
  goal: Position,
  boardSize: BoardSize,
  forwardOnly: boolean = false
): Position[] | null {
  const queue: PathNode[] = [];
  const visited = new Set<string>();
  const startNode: PathNode = {
    position: start,
    parent: null,
    distance: 0,
  };

  queue.push(startNode);
  visited.add(`${start.row},${start.col}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Si llegamos a la meta, reconstruimos el camino
    if (current.position.row === goal.row && current.position.col === goal.col) {
      const path: Position[] = [];
      let node: PathNode | null = current;
      while (node !== null) {
        path.unshift(node.position);
        node = node.parent;
      }
      return path;
    }

    // Explorar movimientos válidos
    const moves = getDiagonalMoves(current.position, boardSize, forwardOnly);
    for (const move of moves) {
      const key = `${move.row},${move.col}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({
          position: move,
          parent: current,
          distance: current.distance + 1,
        });
      }
    }
  }

  return null; // No se encontró camino
}

/**
 * Calcula la distancia más corta entre dos posiciones usando BFS
 */
export function bfsDistance(
  start: Position,
  goal: Position,
  boardSize: BoardSize,
  forwardOnly: boolean = false
): number {
  const path = bfsShortestPath(start, goal, boardSize, forwardOnly);
  return path ? path.length - 1 : Infinity;
}

/**
 * Encuentra todas las posiciones alcanzables desde una posición inicial en un número máximo de pasos
 */
export function bfsReachablePositions(
  start: Position,
  maxSteps: number,
  boardSize: BoardSize,
  forwardOnly: boolean = false
): Set<string> {
  const queue: Array<{ pos: Position; steps: number }> = [];
  const visited = new Set<string>();
  const reachable = new Set<string>();

  queue.push({ pos: start, steps: 0 });
  visited.add(`${start.row},${start.col}`);
  reachable.add(`${start.row},${start.col}`);

  while (queue.length > 0) {
    const { pos, steps } = queue.shift()!;

    if (steps >= maxSteps) continue;

    const moves = getDiagonalMoves(pos, boardSize, forwardOnly);
    for (const move of moves) {
      const key = `${move.row},${move.col}`;
      if (!visited.has(key)) {
        visited.add(key);
        reachable.add(key);
        queue.push({ pos: move, steps: steps + 1 });
      }
    }
  }

  return reachable;
}

