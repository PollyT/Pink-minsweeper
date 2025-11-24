import React from 'react';
import { TarotCard } from '../types';
import { Lock } from 'lucide-react';

interface CollectionProps {
  cards: TarotCard[];
  onSelectCard: (card: TarotCard) => void;
  onClose: () => void;
}

const Collection: React.FC<CollectionProps> = ({ cards, onSelectCard, onClose }) => {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-rose-50/95 backdrop-blur-md animate-in slide-in-from-bottom-10">
      
      <div className="p-6 border-b border-rose-200 flex justify-between items-center bg-white/50">
        <h2 className="text-2xl font-bold text-rose-900">Your Tarot Collection</h2>
        <button 
          onClick={onClose}
          className="text-rose-600 font-semibold hover:underline"
        >
          Back to Game
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {cards.map((card) => (
            <div 
              key={card.id}
              onClick={() => card.unlocked && onSelectCard(card)}
              className={`
                aspect-[2/3] rounded-xl relative overflow-hidden transition-all duration-300
                ${card.unlocked 
                  ? 'cursor-pointer hover:scale-105 hover:shadow-xl shadow-md border-2 border-white' 
                  : 'bg-rose-200/50 border-2 border-dashed border-rose-300 flex items-center justify-center'}
              `}
            >
              {card.unlocked ? (
                <>
                  <img 
                    src={`https://picsum.photos/seed/${card.seed}/200/300`} 
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 p-2">
                    <p className="text-white text-xs font-bold text-center truncate">{card.name}</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-rose-300">
                  <Lock className="w-8 h-8 mb-2" />
                  <span className="text-xs font-bold">Locked</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-white/50 border-t border-rose-200 text-center text-rose-600 text-sm">
        Win games to unlock more cards from the deck.
      </div>
    </div>
  );
};

export default Collection;