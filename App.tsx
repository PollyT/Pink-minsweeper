import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Difficulty, 
  GameStatus, 
  CellData, 
  CellStatus, 
  TarotCard, 
  GameConfig 
} from './types';
import { 
  DIFFICULTY_CONFIG, 
  TAROT_DECK_DATA, 
  MAX_UNDO_CHARGES, 
  MANA_REGEN_TIME_MS 
} from './constants';
import { soundService } from './services/soundService';
import Cell from './components/Cell';
import TarotModal from './components/TarotModal';
import Collection from './components/Collection';
import { RefreshCcw, Settings, Heart, Image as ImageIcon, RotateCcw, Volume2, VolumeX, Flag } from 'lucide-react';

const App: React.FC = () => {
  // Game State
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [flagsUsed, setFlagsUsed] = useState(0);
  
  // Undo / Mana System
  const [undoStack, setUndoStack] = useState<CellData[][][]>([]);
  const [mana, setMana] = useState(MAX_UNDO_CHARGES);
  const [timeToNextMana, setTimeToNextMana] = useState(0); // in ms
  
  // Collection State
  const [deck, setDeck] = useState<TarotCard[]>(() => {
    // Initialize deck status (could load from local storage in real app)
    return TAROT_DECK_DATA.map(c => ({ ...c, unlocked: false }));
  });
  const [showCollection, setShowCollection] = useState(false);
  const [activeCard, setActiveCard] = useState<{card: TarotCard, isNew: boolean} | null>(null);
  
  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Refs for timers
  const manaTimerRef = useRef<number | null>(null);
  const manaIntervalRef = useRef<number | null>(null);

  // --- Initialization ---

  const initGame = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const newGrid: CellData[][] = [];
    for (let y = 0; y < config.rows; y++) {
      const row: CellData[] = [];
      for (let x = 0; x < config.cols; x++) {
        row.push({
          id: `${x}-${y}`,
          x,
          y,
          isMine: false,
          status: CellStatus.HIDDEN,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setStatus(GameStatus.IDLE);
    setFlagsUsed(0);
    setUndoStack([]);
    // Do not reset mana fully, maybe? Let's keep it persistent across games for flow
  }, [difficulty]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // --- Mana Regeneration Logic ---

  useEffect(() => {
    // Ticks every 100ms to update the progress bar for mana
    if (mana < MAX_UNDO_CHARGES) {
        manaIntervalRef.current = window.setInterval(() => {
             setTimeToNextMana(prev => {
                 if (prev <= 100) {
                     setMana(m => Math.min(m + 1, MAX_UNDO_CHARGES));
                     return MANA_REGEN_TIME_MS;
                 }
                 return prev - 100;
             });
        }, 100);
    } else {
        setTimeToNextMana(MANA_REGEN_TIME_MS);
    }

    return () => {
        if (manaIntervalRef.current) clearInterval(manaIntervalRef.current);
    };
  }, [mana]);

  // --- Game Logic ---

  const placeMines = (startX: number, startY: number) => {
    const config = DIFFICULTY_CONFIG[difficulty];
    let minesPlaced = 0;
    const newGrid = [...grid.map(row => [...row.map(cell => ({...cell}))])]; // Deep copy

    // Helper to get random coord
    const getRand = (max: number) => Math.floor(Math.random() * max);

    while (minesPlaced < config.mines) {
      const x = getRand(config.cols);
      const y = getRand(config.rows);

      // Avoid placing mine on start cell or surroundings (safe start)
      const isStartArea = Math.abs(x - startX) <= 1 && Math.abs(y - startY) <= 1;
      
      if (!newGrid[y][x].isMine && !isStartArea) {
        newGrid[y][x].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate numbers
    const dirs = [[-1,-1], [0,-1], [1,-1], [-1,0], [1,0], [-1,1], [0,1], [1,1]];
    for (let y = 0; y < config.rows; y++) {
      for (let x = 0; x < config.cols; x++) {
        if (!newGrid[y][x].isMine) {
          let count = 0;
          dirs.forEach(([dx, dy]) => {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < config.cols && ny >= 0 && ny < config.rows && newGrid[ny][nx].isMine) {
              count++;
            }
          });
          newGrid[y][x].neighborMines = count;
        }
      }
    }
    return newGrid;
  };

  const revealCell = (board: CellData[][], x: number, y: number) => {
    if (x < 0 || x >= board[0].length || y < 0 || y >= board.length) return;
    if (board[y][x].status !== CellStatus.HIDDEN) return;

    board[y][x].status = CellStatus.REVEALED;
    soundService.playPop();

    if (board[y][x].neighborMines === 0 && !board[y][x].isMine) {
      const dirs = [[-1,-1], [0,-1], [1,-1], [-1,0], [1,0], [-1,1], [0,1], [1,1]];
      dirs.forEach(([dx, dy]) => {
        revealCell(board, x + dx, y + dy);
      });
    }
  };

  const handleCellClick = (x: number, y: number) => {
    if (status === GameStatus.WON || status === GameStatus.LOST) return;
    if (grid[y][x].status === CellStatus.FLAGGED) return;

    soundService.playClick();
    
    // Push current state to undo stack before mutation
    if (status === GameStatus.PLAYING) {
        setUndoStack(prev => [...prev.slice(-9), grid]); // Keep last 10 states
    }

    let currentGrid = grid;
    
    if (status === GameStatus.IDLE) {
      currentGrid = placeMines(x, y);
      setStatus(GameStatus.PLAYING);
    }

    const newGrid = [...currentGrid.map(row => [...row.map(cell => ({...cell}))])];
    const target = newGrid[y][x];

    if (target.isMine) {
      target.status = CellStatus.REVEALED;
      setGrid(newGrid);
      setStatus(GameStatus.LOST);
      soundService.playLose();
    } else {
      revealCell(newGrid, x, y);
      setGrid(newGrid);
      checkWin(newGrid);
    }
  };

  const handleCellLongPress = (x: number, y: number) => {
    if (status !== GameStatus.PLAYING) return;
    const cell = grid[y][x];
    if (cell.status !== CellStatus.REVEALED) return;

    const config = DIFFICULTY_CONFIG[difficulty];
    
    // Save undo state before automated clear
    setUndoStack(prev => [...prev.slice(-9), grid]);

    const newGrid = [...grid.map(row => [...row.map(c => ({...c}))])];
    let hitMine = false;
    let changed = false;
    
    const dirs = [[-1,-1], [0,-1], [1,-1], [-1,0], [1,0], [-1,1], [0,1], [1,1]];
    
    dirs.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < config.cols && ny >= 0 && ny < config.rows) {
            const neighbor = newGrid[ny][nx];
            if (neighbor.status === CellStatus.HIDDEN) {
                // If user hasn't flagged it (as per request: "except for the ones marked as mines")
                if (neighbor.isMine) {
                    // Boom
                    neighbor.status = CellStatus.REVEALED;
                    hitMine = true;
                } else {
                    revealCell(newGrid, nx, ny);
                    changed = true;
                }
            }
        }
    });

    if (hitMine) {
        setGrid(newGrid);
        setStatus(GameStatus.LOST);
        soundService.playLose();
    } else if (changed) {
        setGrid(newGrid);
        checkWin(newGrid);
    }
  };

  const handleRightClick = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (status === GameStatus.WON || status === GameStatus.LOST) return;
    if (grid[y][x].status === CellStatus.REVEALED) return;

    soundService.playFlag();

    const newGrid = [...grid.map(row => [...row.map(cell => ({...cell}))])];
    const cell = newGrid[y][x];

    if (cell.status === CellStatus.HIDDEN) {
      cell.status = CellStatus.FLAGGED;
      setFlagsUsed(prev => prev + 1);
    } else {
      cell.status = CellStatus.HIDDEN;
      setFlagsUsed(prev => prev - 1);
    }
    setGrid(newGrid);
  };

  const checkWin = (board: CellData[][]) => {
    const config = DIFFICULTY_CONFIG[difficulty];
    let hiddenOrFlaggedNonMines = 0;
    
    for(let r=0; r<config.rows; r++) {
        for(let c=0; c<config.cols; c++) {
            if (!board[r][c].isMine && board[r][c].status !== CellStatus.REVEALED) {
                hiddenOrFlaggedNonMines++;
            }
        }
    }

    if (hiddenOrFlaggedNonMines === 0) {
      setStatus(GameStatus.WON);
      soundService.playWin();
      handleUnlockReward();
    }
  };

  const handleUnlockReward = () => {
    // Find locked cards
    const locked = deck.filter(c => !c.unlocked);
    let cardToUnlock: TarotCard;

    if (locked.length > 0) {
        // Unlock random new card
        const randomIndex = Math.floor(Math.random() * locked.length);
        cardToUnlock = { ...locked[randomIndex], unlocked: true };
        
        // Update deck
        const newDeck = deck.map(c => c.id === cardToUnlock.id ? cardToUnlock : c);
        setDeck(newDeck);
        setActiveCard({ card: cardToUnlock, isNew: true });
    } else {
        // All unlocked, show a random one for a new reading
        const randomAny = deck[Math.floor(Math.random() * deck.length)];
        setActiveCard({ card: randomAny, isNew: false });
    }
    soundService.playUnlock();
  };

  const handleUndo = () => {
      if (undoStack.length === 0 || mana <= 0 || status === GameStatus.WON) return;
      
      const previousState = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setGrid(previousState);
      setStatus(GameStatus.PLAYING); // Restore playing status if lost
      setMana(m => m - 1);
      soundService.playUndo();
  };

  const toggleSound = () => {
      const newState = !soundEnabled;
      setSoundEnabled(newState);
      soundService.setEnabled(newState);
  };

  return (
    <div className="min-h-screen bg-rose-50 text-rose-900 flex flex-col items-center py-8 px-4 select-none">
      
      {/* Header Area */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
            <span className="text-rose-500 text-4xl">✿</span> Cozy Rose Mines
        </h1>
        <div className="flex gap-4">
            <button 
                onClick={() => setShowCollection(true)}
                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-rose-400 hover:text-rose-600 transition-all"
                title="Tarot Collection"
            >
                <ImageIcon className="w-6 h-6" />
            </button>
            <button 
                onClick={toggleSound}
                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-rose-400 hover:text-rose-600 transition-all"
            >
                {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
        </div>
      </div>

      {/* Main Game Container */}
      <div className="bg-white p-6 rounded-3xl shadow-xl shadow-rose-200/50 flex flex-col items-center gap-6 max-w-full overflow-hidden">
        
        {/* Controls Bar */}
        <div className="flex flex-wrap justify-center gap-4 w-full">
            <div className="flex bg-rose-100 rounded-lg p-1">
                {Object.values(Difficulty).map(diff => (
                    <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`px-4 py-1 rounded-md text-sm font-bold transition-all ${difficulty === diff ? 'bg-white text-rose-600 shadow-sm' : 'text-rose-400 hover:text-rose-500'}`}
                    >
                        {diff}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4 bg-rose-50 px-4 py-1 rounded-lg border border-rose-100">
                <div className="flex items-center gap-2 text-rose-800 font-mono font-bold">
                    <div className="w-8 h-8 bg-rose-200 rounded flex items-center justify-center">
                        <Flag className="w-4 h-4 text-rose-600" />
                    </div>
                    {DIFFICULTY_CONFIG[difficulty].mines - flagsUsed}
                </div>
                <div className="w-px h-6 bg-rose-200"></div>
                <button 
                    onClick={initGame} 
                    className="p-2 hover:bg-rose-200 rounded-full transition-colors"
                    title="Restart"
                >
                    <RefreshCcw className="w-5 h-5 text-rose-600" />
                </button>
            </div>

            {/* Undo / Mana Control */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleUndo}
                    disabled={mana === 0 || undoStack.length === 0 || status === GameStatus.WON}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all
                        ${mana > 0 && undoStack.length > 0 && status !== GameStatus.WON
                            ? 'bg-rose-500 text-white shadow-md hover:bg-rose-600 active:scale-95' 
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'}
                    `}
                >
                    <RotateCcw className="w-4 h-4" />
                    <span>Undo</span>
                </button>
                
                {/* Mana Hearts */}
                <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                        {[...Array(MAX_UNDO_CHARGES)].map((_, i) => (
                            <Heart 
                                key={i} 
                                className={`w-5 h-5 transition-colors duration-500 ${i < mana ? 'text-rose-500 fill-rose-500' : 'text-rose-200'}`} 
                            />
                        ))}
                    </div>
                    {/* Tiny progress bar for next mana */}
                    {mana < MAX_UNDO_CHARGES && (
                        <div className="w-full h-1 bg-rose-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-rose-300 transition-all duration-100 ease-linear"
                                style={{ width: `${100 - (timeToNextMana / MANA_REGEN_TIME_MS) * 100}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Board */}
        <div className="overflow-auto max-w-[90vw] max-h-[70vh] rounded-xl border-4 border-rose-100 scrollbar-thin">
            <div 
                className="grid gap-[2px] bg-rose-300 border-2 border-rose-300"
                style={{ 
                    gridTemplateColumns: `repeat(${DIFFICULTY_CONFIG[difficulty].cols}, min-content)` 
                }}
            >
                {grid.map((row, y) => (
                    row.map((cell, x) => (
                        <Cell 
                            key={cell.id} 
                            data={cell} 
                            onClick={handleCellClick} 
                            onContextMenu={handleRightClick}
                            onLongPress={handleCellLongPress}
                            gameOver={status === GameStatus.WON || status === GameStatus.LOST}
                        />
                    ))
                ))}
            </div>
        </div>
        
        {/* Game Status Message */}
        {status === GameStatus.LOST && (
            <div className="text-rose-600 font-bold animate-pulse">
                Oh no! Try using an Undo if you have mana left.
            </div>
        )}

      </div>

      {/* Modals */}
      {activeCard && (
        <TarotModal 
            card={activeCard.card} 
            isNewUnlock={activeCard.isNew} 
            onClose={() => setActiveCard(null)} 
        />
      )}

      {showCollection && (
          <Collection 
            cards={deck} 
            onClose={() => setShowCollection(false)} 
            onSelectCard={(c) => {
                setShowCollection(false);
                setActiveCard({ card: c, isNew: false });
            }} 
          />
      )}

    </div>
  );
};

export default App;