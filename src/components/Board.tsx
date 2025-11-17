/**
 * Componente del tablero de juego
 */

import { BoardSize, GamePiece, Position } from '../types';
import { isWhiteSquare } from '../utils/boardUtils';

interface BoardProps {
  size: BoardSize;
  police: GamePiece[];
  thieves: GamePiece[];
  onCellClick?: (position: Position) => void;
  selectedThiefId?: string | null;
  validMoves?: Position[];
  cellSize?: 'small' | 'medium' | 'large';
  colorScheme?: 'default' | 'dark' | 'colorful';
  showAnimations?: boolean;
}

export function Board({ 
  size, 
  police, 
  thieves, 
  onCellClick, 
  selectedThiefId,
  validMoves = [],
  cellSize = 'medium',
  colorScheme = 'default',
  showAnimations = true,
}: BoardProps) {
  // Tamaños de celda según configuración
  const cellSizeClasses = {
    small: size === 8 ? 'w-12 h-12' : 'w-6 h-6',
    medium: size === 8 ? 'w-16 h-16' : 'w-8 h-8',
    large: size === 8 ? 'w-20 h-20' : 'w-10 h-10',
  };

  const textSizeClasses = {
    small: size === 8 ? 'text-lg' : 'text-xs',
    medium: size === 8 ? 'text-2xl' : 'text-sm',
    large: size === 8 ? 'text-3xl' : 'text-base',
  };

  const cellSizeClass = cellSizeClasses[cellSize];
  const textSizeClass = textSizeClasses[cellSize];

  // Esquemas de color
  const getColorClasses = (isWhite: boolean, isSelected: boolean, isValidMove: boolean) => {
    if (isValidMove) {
      return 'bg-green-400 bg-opacity-70 border-green-600';
    }
    if (isSelected) {
      return 'bg-yellow-400 border-yellow-600';
    }

    if (colorScheme === 'dark') {
      return isWhite ? 'bg-gray-700' : 'bg-gray-900';
    } else if (colorScheme === 'colorful') {
      return isWhite ? 'bg-blue-100' : 'bg-purple-200';
    } else {
      return isWhite ? 'bg-amber-50' : 'bg-amber-900';
    }
  };

  const getPieceAt = (row: number, col: number): GamePiece | null => {
    // Verificar ladrones primero
    const thief = thieves.find(
      (t) => t.position.row === row && t.position.col === col
    );
    if (thief) return thief;

    // Verificar policías
    const cop = police.find(
      (p) => p.position.row === row && p.position.col === col
    );
    return cop || null;
  };

  const isSelected = (row: number, col: number): boolean => {
    if (!selectedThiefId) return false;
    const thief = thieves.find(t => t.id === selectedThiefId);
    return thief?.position.row === row && thief?.position.col === col;
  };

  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some(
      (move) => move.row === row && move.col === col
    );
  };

  return (
    <div className="flex flex-col items-center gap-1 p-4 bg-gray-100 rounded-lg shadow-lg">
      <div 
        className={`grid gap-0 border-4 border-gray-800 ${showAnimations ? 'transition-all duration-300' : ''}`}
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {Array.from({ length: size }).map((_, row) =>
          Array.from({ length: size }).map((_, col) => {
            const piece = getPieceAt(row, col);
            const isWhite = isWhiteSquare({ row, col });
            const selected = isSelected(row, col);
            const validMove = isValidMove(row, col);
            const bgColor = getColorClasses(isWhite, selected, validMove);

            return (
              <div
                key={`${row}-${col}`}
                className={`
                  ${cellSizeClass} ${bgColor} 
                  flex items-center justify-center 
                  border border-gray-600
                  ${onCellClick ? 'cursor-pointer hover:opacity-80' : ''}
                  ${showAnimations ? 'transition-all duration-150' : ''}
                  ${validMove ? 'hover:bg-green-500 hover:bg-opacity-90' : ''}
                `}
                onClick={() => onCellClick?.({ row, col })}
              >
                {piece && (
                  <div
                    className={`
                      ${textSizeClass} 
                      ${piece.type === 'thief' ? 'text-red-600' : 'text-blue-600'}
                      font-bold
                      drop-shadow-lg
                      ${showAnimations ? 'animate-pulse' : ''}
                    `}
                  >
                    {piece.type === 'thief' ? '🏃' : '👮'}
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
