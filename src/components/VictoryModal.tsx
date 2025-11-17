/**
 * Componente modal para mostrar el resultado del juego
 */

interface VictoryModalProps {
  isOpen: boolean;
  winner: 'thief' | 'police';
  message: string;
  onClose: () => void;
}

export function VictoryModal({ isOpen, winner, message, onClose }: VictoryModalProps) {
  if (!isOpen) return null;

  const isThiefWin = winner === 'thief';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className={`text-6xl mb-4 ${isThiefWin ? 'text-red-600' : 'text-blue-600'}`}>
            {isThiefWin ? '🏃' : '👮'}
          </div>
          <h2 className={`text-3xl font-bold mb-4 ${isThiefWin ? 'text-red-600' : 'text-blue-600'}`}>
            {isThiefWin ? '¡El Ladrón Ha Ganado!' : '¡Los Policías Han Ganado!'}
          </h2>
          <p className="text-gray-700 text-lg mb-6">
            {message}
          </p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

