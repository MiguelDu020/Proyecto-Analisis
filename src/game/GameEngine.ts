/**
 * Motor principal del juego
 * Maneja la lógica del juego, turnos, validaciones y estado
 */

import {
  Position,
  BoardSize,
  GamePiece,
  GameState,
  GameConfig,
  GameStatus,
  Move,
  GameResult,
} from '../types';
import { isWhiteSquare, hasThiefReachedBottom, getDiagonalMoves } from '../utils/boardUtils';
import { calculatePoliceMoves } from '../algorithms/policeStrategy';
import { calculateThiefMove } from '../algorithms/thiefStrategy';

export class GameEngine {
  private boardSize: BoardSize;
  private police: GamePiece[] = [];
  private thieves: GamePiece[] = [];
  private state: GameState = 'not-started';
  private turn: number = 0;
  private currentPlayer: 'thief' | 'police' = 'thief';
  private moves: Move[] = [];
  private config: GameConfig;
  private result?: GameResult;
  private maxTurns: number = 200; // Criterio de empate

  constructor(config: GameConfig) {
    this.config = config;
    this.boardSize = config.boardSize;
    this.state = 'not-started';
  }

  /**
   * Inicializa el juego con las piezas en sus posiciones iniciales
   * Complejidad: O(P + T) donde P es el número de policías y T el número de ladrones
   */
  initializeGame(): void {
    // Inicializar policías - siempre posiciones aleatorias
    this.police = [];
    const bottomRow = this.boardSize - 1;
    const whiteColumns: number[] = [];
    for (let col = 0; col < this.boardSize; col++) {
      if (isWhiteSquare({ row: bottomRow, col })) {
        whiteColumns.push(col);
      }
    }
    // Mezclar columnas para aleatoriedad
    const shuffled = [...whiteColumns].sort(() => Math.random() - 0.5);
    const policeCount = Math.min(this.config.policeCount, whiteColumns.length);
    for (let i = 0; i < policeCount; i++) {
      this.police.push({
        id: `police-${i}`,
        type: 'police',
        position: { row: bottomRow, col: shuffled[i] },
      });
    }

    // Inicializar ladrones - siempre posiciones aleatorias en la fila superior
    this.thieves = [];
    const topRow = 0;
    const thiefWhiteColumns: number[] = [];
    for (let col = 0; col < this.boardSize; col++) {
      if (isWhiteSquare({ row: topRow, col })) {
        thiefWhiteColumns.push(col);
      }
    }
    const thiefShuffled = [...thiefWhiteColumns].sort(() => Math.random() - 0.5);
    const thiefCount = Math.min(this.config.thiefCount, thiefWhiteColumns.length);
    for (let i = 0; i < thiefCount; i++) {
      this.thieves.push({
        id: `thief-${i}`,
        type: 'thief',
        position: { row: topRow, col: thiefShuffled[i] },
      });
    }

    this.state = 'not-started';
    this.turn = 0;
    this.currentPlayer = 'thief';
    this.moves = [];
    this.result = undefined;
  }

  /**
   * Inicia el juego
   */
  start(): void {
    if (this.state === 'not-started') {
      this.state = 'playing';
    }
  }

  /**
   * Obtiene el estado actual del juego
   */
  getStatus(): GameStatus {
    return {
      state: this.state,
      turn: this.turn,
      currentPlayer: this.currentPlayer,
      moves: [...this.moves],
      result: this.result,
    };
  }

  /**
   * Obtiene todas las piezas del tablero
   */
  getPieces(): { police: GamePiece[]; thieves: GamePiece[] } {
    return {
      police: [...this.police],
      thieves: [...this.thieves],
    };
  }

  /**
   * Obtiene el tamaño del tablero
   */
  getBoardSize(): BoardSize {
    return this.boardSize;
  }

  /**
   * Obtiene los movimientos válidos para un ladrón
   */
  getValidThiefMoves(thiefId: string): Position[] {
    const thief = this.thieves.find(t => t.id === thiefId);
    if (!thief) return [];

    const allMoves = getDiagonalMoves(thief.position, this.boardSize, false);
    const occupiedPositions = new Set<string>();
    
    // Agregar posiciones ocupadas por policías
    this.police.forEach(p => {
      occupiedPositions.add(`${p.position.row},${p.position.col}`);
    });
    
    // Agregar posiciones ocupadas por otros ladrones
    this.thieves.forEach(t => {
      if (t.id !== thiefId) {
        occupiedPositions.add(`${t.position.row},${t.position.col}`);
      }
    });

    return allMoves.filter(move => {
      const key = `${move.row},${move.col}`;
      return !occupiedPositions.has(key);
    });
  }

  /**
   * Ejecuta el turno del ladrón (manual o automático)
   * Complejidad: O(1) para movimiento manual, O(M*H) para automático
   */
  makeThiefMove(thiefId: string, targetPosition?: Position): boolean {
    if (this.state !== 'playing' || this.currentPlayer !== 'thief') {
      return false;
    }

    const thief = this.thieves.find(t => t.id === thiefId);
    if (!thief) return false;

    let newPosition: Position;

    if (targetPosition) {
      // Movimiento manual
      newPosition = targetPosition;
    } else {
      // Movimiento automático según el modo
      const calculatedMove = calculateThiefMove(
        thief,
        this.police,
        this.boardSize,
        this.config.thiefMode,
        this.thieves // Pasar todos los ladrones para evitar colisiones
      );

      if (!calculatedMove) {
        // No hay movimientos válidos para este ladrón
        // Verificar si todos los ladrones están bloqueados
        const allBlocked = this.checkThievesBlocked();
        
        if (allBlocked) {
          this.endGame('police', this.config.thiefMode === 'manual', 'no-moves');
          return false;
        }
        return false;
      }

      newPosition = calculatedMove;
    }

    // Validar movimiento
    if (!this.isValidThiefMove(thief, newPosition)) {
      // En modo manual, si el movimiento no es válido, verificar si hay movimientos válidos
      if (targetPosition) {
        const validMoves = this.getValidThiefMoves(thief.id);
        if (validMoves.length === 0) {
          // No hay movimientos válidos, el ladrón está bloqueado
          const allBlocked = this.checkThievesBlocked();
          if (allBlocked) {
            this.endGame('police', true, 'no-moves');
            return false;
          }
        }
      }
      return false;
    }

    // Registrar movimiento
    this.moves.push({
      pieceId: thief.id,
      from: { ...thief.position },
      to: newPosition,
      turn: this.turn,
    });

    // Actualizar posición
    thief.position = newPosition;

    // Verificar captura por policía
    for (const cop of this.police) {
      if (cop.position.row === thief.position.row && 
          cop.position.col === thief.position.col) {
        this.endGame('police', this.config.thiefMode === 'manual', 'captured');
        return true;
      }
    }

    // Verificar victoria del ladrón (llegó al borde inferior)
    if (hasThiefReachedBottom(thief.position, this.boardSize)) {
      // Si al menos un ladrón llegó, ganan los ladrones
      this.endGame('thief', this.config.thiefMode === 'manual');
      return true;
    }

    // Verificar si todos los ladrones han movido en este turno
    const allThievesMoved = this.thieves.every(t => {
      const lastMove = this.moves
        .filter(m => m.pieceId === t.id)
        .sort((a, b) => b.turn - a.turn)[0];
      return lastMove && lastMove.turn === this.turn;
    });

    // Si todos los ladrones han movido, cambiar turno a policías
    if (allThievesMoved) {
      this.currentPlayer = 'police';
      
      // Después de cambiar turno, verificar si los ladrones quedaron bloqueados
      // (esto puede pasar si los policías los rodearon)
      const allBlocked = this.checkThievesBlocked();
      if (allBlocked) {
        this.endGame('police', this.config.thiefMode === 'manual', 'no-moves');
        return true;
      }
    }

    return true;
  }

  /**
   * Ejecuta el turno de los policías (automático)
   * Complejidad: O(P * M * H) donde P=policías, M=movimientos, H=heurística
   */
  makePoliceMove(): boolean {
    if (this.state !== 'playing' || this.currentPlayer !== 'police') {
      return false;
    }

    // Calcular movimientos para TODOS los policías juntos
    // Usar el ladrón más cercano al grupo de policías como objetivo principal
    let targetThief = this.thieves[0];
    let minAvgDist = Infinity;
    
    // Encontrar el ladrón más cercano al promedio de posiciones de los policías
    for (const thief of this.thieves) {
      let totalDist = 0;
      for (const cop of this.police) {
        const dist = Math.abs(cop.position.row - thief.position.row) + 
                     Math.abs(cop.position.col - thief.position.col);
        totalDist += dist;
      }
      const avgDist = totalDist / this.police.length;
      if (avgDist < minAvgDist) {
        minAvgDist = avgDist;
        targetThief = thief;
      }
    }

    // Calcular movimientos para TODOS los policías juntos (mejor coordinación)
    const moves = calculatePoliceMoves(this.police, targetThief, this.boardSize);

    // Aplicar movimientos - asegurarse de que todos los policías se muevan si es posible
    const usedPositions = new Set<string>();
    
    for (const cop of this.police) {
      let newPosition = moves.get(cop.id);
      
      // Si no hay movimiento asignado, intentar obtener uno válido
      if (!newPosition) {
        let possibleMoves = getDiagonalMoves(cop.position, this.boardSize, true);
        
        // Si no hay movimientos hacia adelante y está en la fila 0, permitir moverse hacia atrás
        if (possibleMoves.length === 0 && cop.position.row === 0) {
          possibleMoves = getDiagonalMoves(cop.position, this.boardSize, false).filter(move => 
            move.row > cop.position.row // Solo movimientos hacia abajo
          );
        }
        
        // Buscar el primer movimiento disponible que no esté ocupado
        for (const move of possibleMoves) {
          const moveKey = `${move.row},${move.col}`;
          if (!usedPositions.has(moveKey)) {
            // Verificar que no esté ocupado por otro policía o ladrón
            let isOccupied = false;
            for (const otherCop of this.police) {
              if (otherCop.id !== cop.id && 
                  otherCop.position.row === move.row && 
                  otherCop.position.col === move.col) {
                isOccupied = true;
                break;
              }
            }
            if (!isOccupied) {
              for (const thief of this.thieves) {
                if (thief.position.row === move.row && 
                    thief.position.col === move.col) {
                  isOccupied = true;
                  break;
                }
              }
            }
            if (!isOccupied) {
              newPosition = move;
              break;
            }
          }
        }
      }
      
      // Si hay un movimiento asignado, mover
      if (newPosition) {
        // Verificar captura ANTES de mover (por si el movimiento es hacia el ladrón)
        for (const thief of this.thieves) {
          if (newPosition.row === thief.position.row && 
              newPosition.col === thief.position.col) {
            // Mover y capturar
            this.moves.push({
              pieceId: cop.id,
              from: { ...cop.position },
              to: newPosition,
              turn: this.turn,
            });
            cop.position = newPosition;
            this.endGame('police', this.config.thiefMode === 'manual', 'captured');
            return true;
          }
        }
        
        // Si no es captura, mover normalmente (solo si es diferente a la posición actual)
        if (newPosition.row !== cop.position.row || newPosition.col !== cop.position.col) {
          const posKey = `${newPosition.row},${newPosition.col}`;
          // Verificar que la posición no esté ocupada por otro policía que ya se movió
          if (!usedPositions.has(posKey)) {
            this.moves.push({
              pieceId: cop.id,
              from: { ...cop.position },
              to: newPosition,
              turn: this.turn,
            });

            cop.position = newPosition;
            usedPositions.add(posKey);
          }
        }
      }
    }

    // Verificar criterio de empate (máximo de turnos)
    if (this.turn >= this.maxTurns) {
      this.endGame('thief', this.config.thiefMode === 'manual');
      return true;
    }

    // Incrementar turno y cambiar jugador
    this.turn++;
    this.currentPlayer = 'thief';
    
    // Verificar si los ladrones quedaron bloqueados después del movimiento de los policías
    const allBlocked = this.checkThievesBlocked();
    if (allBlocked) {
      this.endGame('police', this.config.thiefMode === 'manual', 'no-moves');
      return true;
    }
    
    return true;
  }

  /**
   * Termina el juego con un resultado
   */
  private endGame(winner: 'thief' | 'police', isManual: boolean, reason?: 'captured' | 'no-moves'): void {
    this.state = winner === 'thief' ? 'thief-won' : 'police-won';
    
    if (winner === 'police') {
      if (reason === 'no-moves') {
        // El ladrón no tiene movimientos válidos
        this.result = {
          winner: 'police',
          message: isManual ? 'Has perdido - No tienes movimientos válidos' : 'Los policías han ganado - El ladrón no tiene movimientos',
          isManual,
        };
      } else {
        // Captura directa
        this.result = {
          winner: 'police',
          message: isManual ? 'Derrota - Ladrón atrapado' : 'Ladrón atrapado',
          isManual,
        };
      }
    } else {
      this.result = {
        winner: 'thief',
        message: 'Victoria del Ladrón',
        isManual,
      };
    }
  }

  /**
   * Verifica si todos los ladrones están bloqueados (sin movimientos válidos)
   */
  checkThievesBlocked(): boolean {
    return this.thieves.every(thief => {
      const validMoves = this.getValidThiefMoves(thief.id);
      return validMoves.length === 0;
    });
  }

  /**
   * Valida si un movimiento del ladrón es válido
   */
  private isValidThiefMove(thief: GamePiece, to: Position): boolean {
    // Verificar que sea movimiento diagonal
    const rowDiff = Math.abs(to.row - thief.position.row);
    const colDiff = Math.abs(to.col - thief.position.col);

    if (rowDiff !== 1 || colDiff !== 1) {
      return false;
    }

    // Verificar límites del tablero
    if (to.row < 0 || to.row >= this.boardSize || 
        to.col < 0 || to.col >= this.boardSize) {
      return false;
    }

    // Verificar que la casilla no esté ocupada por un policía
    for (const cop of this.police) {
      if (cop.position.row === to.row && cop.position.col === to.col) {
        return false;
      }
    }

    // Verificar que la casilla no esté ocupada por otro ladrón
    for (const otherThief of this.thieves) {
      if (otherThief.id !== thief.id && 
          otherThief.position.row === to.row && 
          otherThief.position.col === to.col) {
        return false;
      }
    }

    return true;
  }

  /**
   * Reinicia el juego
   */
  reset(): void {
    this.initializeGame();
  }

  /**
   * Actualiza la configuración del juego
   */
  updateConfig(config: Partial<GameConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.boardSize) {
      this.boardSize = config.boardSize;
    }
    this.initializeGame();
  }

  /**
   * Pausa o reanuda el juego
   */
  setPaused(paused: boolean): void {
    if (this.state === 'playing') {
      this.state = paused ? 'paused' : 'playing';
    }
  }

  /**
   * Avanza un turno (paso a paso)
   */
  step(): boolean {
    if (this.state !== 'playing') return false;

    if (this.currentPlayer === 'thief') {
      // Mover todos los ladrones en modo automático
      if (this.config.thiefMode !== 'manual') {
        for (const thief of this.thieves) {
          this.makeThiefMove(thief.id);
        }
      }
      // En modo manual, el usuario debe hacer clic
      return true;
    } else {
      // Mover policías
      return this.makePoliceMove();
    }
  }
}
