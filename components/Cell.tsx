import React, { useRef } from 'react';
import { CellData, CellStatus } from '../types';
import { Flag, Bomb } from 'lucide-react';

interface CellProps {
  data: CellData;
  onClick: (x: number, y: number) => void;
  onContextMenu: (e: React.MouseEvent, x: number, y: number) => void;
  onLongPress: (x: number, y: number) => void;
  gameOver: boolean;
}

const Cell: React.FC<CellProps> = ({ data, onClick, onContextMenu, onLongPress, gameOver }) => {
  const { x, y, status, isMine, neighborMines } = data;
  const longPressTimer = useRef<number | null>(null);

  const getCellContent = () => {
    if (status === CellStatus.FLAGGED) {
      return <Flag className="w-4 h-4 text-rose-500 fill-rose-500" />;
    }
    if (status === CellStatus.REVEALED) {
      if (isMine) {
        return <Bomb className="w-5 h-5 text-rose-800 animate-pulse" />;
      }
      return neighborMines > 0 ? (
        <span className={`font-bold text-lg ${getNumberColor(neighborMines)}`}>
          {neighborMines}
        </span>
      ) : null;
    }
    // Previously, we revealed all mines here if gameOver was true. 
    // That block has been removed to satisfy the request: "only the misclicked mines reveals".
    
    return null;
  };

  const getNumberColor = (num: number) => {
    const colors = [
      '',
      'text-rose-400',
      'text-pink-500',
      'text-fuchsia-500',
      'text-purple-600',
      'text-violet-700',
      'text-indigo-800',
      'text-slate-800',
      'text-black'
    ];
    return colors[num] || 'text-gray-700';
  };

  const baseClasses = "w-8 h-8 sm:w-10 sm:h-10 border rounded transition-all duration-200 flex items-center justify-center cursor-pointer select-none touch-manipulation";
  
  let statusClasses = "";
  if (status === CellStatus.HIDDEN) {
    statusClasses = "bg-rose-200 border-rose-300 hover:bg-rose-200/80 shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[1px]";
  } else if (status === CellStatus.FLAGGED) {
    statusClasses = "bg-rose-100 border-rose-300 shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]";
  } else if (status === CellStatus.REVEALED) {
    if (isMine) {
      statusClasses = "bg-red-200 border-red-300";
    } else {
      statusClasses = "bg-white/60 border-rose-100";
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only left click or touch
    
    longPressTimer.current = window.setTimeout(() => {
      onLongPress(x, y);
      longPressTimer.current = null;
    }, 500); // 500ms threshold
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div
      className={`${baseClasses} ${statusClasses}`}
      onClick={() => onClick(x, y)}
      onContextMenu={(e) => onContextMenu(e, x, y)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {getCellContent()}
    </div>
  );
};

export default React.memo(Cell);