/**
 * Estrategia inteligente para los policías
 * Implementa múltiples algoritmos para decidir los mejores movimientos
 */

import { Position, BoardSize, GamePiece } from '../types';
import { getDiagonalMoves, canCapture, manhattanDistance } from '../utils/boardUtils';
import { bfsShortestPath } from './bfs';
import { policeHeuristic, minPoliceDistance } from './heuristics';

export type PoliceMove = {
  policeId: string;
  newPosition: Position;
  score: number;
};

/**
 * Estrategia principal: Asignación óptima de movimientos usando heurísticas
 * Complejidad temporal: O(P * M * H) donde:
 *   P = número de policías
 *   M = número de movimientos posibles por policía (máximo 2)
 *   H = complejidad de calcular la heurística
 * 
 * Complejidad espacial: O(P * M) para almacenar los movimientos candidatos
 */
export function calculatePoliceMoves(
  police: GamePiece[],
  thief: GamePiece,
  boardSize: BoardSize
): Map<string, Position> {
  const moves = new Map<string, Position>();

  // PRIORIDAD 1: Si algún policía puede capturar, hacerlo INMEDIATAMENTE
  for (const cop of police) {
    const captureMoves = getDiagonalMoves(cop.position, boardSize, true);
    const canCaptureNow = captureMoves.some(
      move => move.row === thief.position.row && move.col === thief.position.col
    );
    
    if (canCaptureNow) {
      moves.set(cop.id, thief.position);
      // Los demás policías no se mueven si hay captura inminente
      return moves;
    }
  }

  // PRIORIDAD 2: Asignación greedy mejorada - siempre moverse hacia el ladrón
  const assignedMoves = greedyAssignment(police, thief, boardSize);

  return assignedMoves;
}

/**
 * Asignación codiciosa (Greedy) de movimientos de policías - VERSIÓN MEJORADA
 * Garantiza que los policías siempre se muevan hacia el ladrón
 * Complejidad: O(P² * M) donde P es el número de policías y M es el número de movimientos
 */
function greedyAssignment(
  police: GamePiece[],
  thief: GamePiece,
  boardSize: BoardSize
): Map<string, Position> {
  const moves = new Map<string, Position>();
  const usedPositions = new Set<string>();
  const thiefPosKey = `${thief.position.row},${thief.position.col}`;

  // Generar todos los movimientos posibles para cada policía
  const candidateMoves: Array<{
    policeId: string;
    position: Position;
    score: number;
    distanceToThief: number;
    rowImprovement: number; // Mejora en fila (más negativo = mejor, porque se acerca)
  }> = [];

  for (const cop of police) {
    let possibleMoves = getDiagonalMoves(cop.position, boardSize, true);
    
    // Si no hay movimientos hacia adelante (por ejemplo, está en la fila 0),
    // permitir movimientos hacia atrás para seguir persiguiendo al ladrón
    if (possibleMoves.length === 0 && cop.position.row === 0) {
      // Si está en la fila superior, permitir moverse hacia atrás (hacia abajo)
      possibleMoves = getDiagonalMoves(cop.position, boardSize, false).filter(move => 
        move.row > cop.position.row // Solo movimientos hacia abajo
      );
    }
    
    // Si aún no hay movimientos válidos, el policía está realmente atascado
    if (possibleMoves.length === 0) {
      continue; // No agregar movimiento si está atascado
    }
    
    for (const move of possibleMoves) {
      const moveKey = `${move.row},${move.col}`;
      
      // Si este movimiento captura al ladrón, prioridad MÁXIMA
      if (moveKey === thiefPosKey) {
        candidateMoves.push({
          policeId: cop.id,
          position: move,
          score: -10000, // Prioridad máxima absoluta
          distanceToThief: 0,
          rowImprovement: -Infinity,
        });
        continue;
      }

      // Calcular distancia Manhattan al ladrón
      const manhattanDist = manhattanDistance(move, thief.position);
      const currentDist = manhattanDistance(cop.position, thief.position);
      
      // Calcular mejora en fila (cuánto más cerca está del ladrón en fila)
      const currentRowDiff = cop.position.row - thief.position.row; // Positivo si está abajo del ladrón
      const newRowDiff = move.row - thief.position.row;
      const rowImprovement = currentRowDiff - newRowDiff; // Positivo si mejora (se acerca)
      
      // Calcular mejora en columna
      const currentColDiff = Math.abs(cop.position.col - thief.position.col);
      const newColDiff = Math.abs(move.col - thief.position.col);
      const colImprovement = currentColDiff - newColDiff;
      
      // Score: menor es mejor
      // Priorizar: 1) Captura, 2) Mejora en distancia, 3) Mejora en fila, 4) Mejora en columna
      const distanceImprovement = currentDist - manhattanDist;
      const score = manhattanDist - (distanceImprovement * 10) - (rowImprovement * 5) - (colImprovement * 3);

      candidateMoves.push({
        policeId: cop.id,
        position: move,
        score: score,
        distanceToThief: manhattanDist,
        rowImprovement: rowImprovement,
      });
    }
  }

  // Ordenar por score (menor = mejor)
  candidateMoves.sort((a, b) => a.score - b.score);

  // Asignar movimientos de forma codiciosa
  const assignedPolice = new Set<string>();
  for (const candidate of candidateMoves) {
    if (assignedPolice.has(candidate.policeId)) continue;

    const posKey = `${candidate.position.row},${candidate.position.col}`;
    if (usedPositions.has(posKey)) continue; // Evitar colisiones

    // SIEMPRE asignar el mejor movimiento disponible
    moves.set(candidate.policeId, candidate.position);
    assignedPolice.add(candidate.policeId);
    usedPositions.add(posKey);
  }

  // Asegurar que TODOS los policías tengan un movimiento asignado
  for (const cop of police) {
    if (!moves.has(cop.id)) {
      // Buscar el mejor movimiento disponible para este policía
      const bestMove = candidateMoves
        .filter(c => c.policeId === cop.id)
        .sort((a, b) => a.score - b.score)[0];
      
      if (bestMove) {
        const posKey = `${bestMove.position.row},${bestMove.position.col}`;
        if (!usedPositions.has(posKey)) {
          // Asignar el mejor movimiento si no está ocupado
          moves.set(cop.id, bestMove.position);
          usedPositions.add(posKey);
        } else {
          // Si el mejor movimiento está ocupado, buscar cualquier movimiento disponible
          const possibleMoves = getDiagonalMoves(cop.position, boardSize, true);
          let assigned = false;
          
          // Intentar asignar cualquier movimiento disponible
          for (const move of possibleMoves) {
            const moveKey = `${move.row},${move.col}`;
            if (!usedPositions.has(moveKey)) {
              moves.set(cop.id, move);
              usedPositions.add(moveKey);
              assigned = true;
              break;
            }
          }
          
          // Si aún no se asignó, buscar movimientos de otros policías que puedan intercambiarse
          if (!assigned && possibleMoves.length > 0) {
            // Asignar el primer movimiento disponible (aunque esté ocupado por otro policía)
            // Esto puede causar que dos policías intenten ir al mismo lugar, pero GameEngine lo manejará
            moves.set(cop.id, possibleMoves[0]);
          }
        }
      } else {
        // Si no hay movimientos candidatos, obtener movimientos posibles directamente
        const possibleMoves = getDiagonalMoves(cop.position, boardSize, true);
        if (possibleMoves.length > 0) {
          // Intentar asignar cualquier movimiento disponible
          for (const move of possibleMoves) {
            const posKey = `${move.row},${move.col}`;
            if (!usedPositions.has(posKey)) {
              moves.set(cop.id, move);
              usedPositions.add(posKey);
              break;
            }
          }
          
          // Si aún no hay movimiento, asignar el primero disponible (GameEngine validará)
          if (!moves.has(cop.id) && possibleMoves.length > 0) {
            moves.set(cop.id, possibleMoves[0]);
          }
        }
      }
    }
  }

  return moves;
}

/**
 * Estrategia alternativa: Minimax simplificado (1 nivel de profundidad)
 * Evalúa cada posible combinación de movimientos de policías
 */
export function minimaxPoliceMoves(
  police: GamePiece[],
  thief: GamePiece,
  boardSize: BoardSize
): Map<string, Position> {
  const moves = new Map<string, Position>();

  // Verificar captura inmediata
  for (const cop of police) {
    if (canCapture(cop.position, thief.position, boardSize)) {
      moves.set(cop.id, thief.position);
      return moves;
    }
  }

  // Evaluar todas las combinaciones posibles de movimientos
  let bestScore = Infinity;
  let bestMoves: Map<string, Position> | null = null;

  // Generar todas las combinaciones de movimientos
  const moveCombinations = generateMoveCombinations(police, boardSize);

  for (const combination of moveCombinations) {
    // Crear policías temporales con las nuevas posiciones
    const tempPolice = police.map((cop) => {
      const newPos = combination.get(cop.id) || cop.position;
      return { ...cop, position: newPos };
    });

    // Calcular heurística para esta combinación
    const score = policeHeuristic(tempPolice, thief, boardSize);

    if (score < bestScore) {
      bestScore = score;
      bestMoves = new Map(combination);
    }
  }

  return bestMoves || moves;
}

/**
 * Genera todas las combinaciones posibles de movimientos para los policías
 */
function generateMoveCombinations(
  police: GamePiece[],
  boardSize: BoardSize
): Array<Map<string, Position>> {
  const combinations: Array<Map<string, Position>> = [];

  // Función recursiva para generar combinaciones
  function generate(
    index: number,
    current: Map<string, Position>
  ): void {
    if (index >= police.length) {
      combinations.push(new Map(current));
      return;
    }

    const cop = police[index];
    const possibleMoves = getDiagonalMoves(cop.position, boardSize, true);
    possibleMoves.push(cop.position); // Incluir opción de no moverse

    for (const move of possibleMoves) {
      current.set(cop.id, move);
      generate(index + 1, current);
      current.delete(cop.id);
    }
  }

  generate(0, new Map());
  return combinations;
}
