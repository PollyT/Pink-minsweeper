import React, { useEffect, useState } from 'react';
import { TarotCard } from '../types';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { generateTarotReading } from '../services/geminiService';

interface TarotModalProps {
  card: TarotCard;
  onClose: () => void;
  isNewUnlock: boolean;
}

const TarotModal: React.FC<TarotModalProps> = ({ card, onClose, isNewUnlock }) => {
  const [reading, setReading] = useState<string | null>(card.reading || null);
  const [loading, setLoading] = useState<boolean>(!card.reading);

  useEffect(() => {
    if (!card.reading) {
      const fetchReading = async () => {
        setLoading(true);
        const text = await generateTarotReading(card.name, card.keywords);
        setReading(text);
        // We'd ideally save this back to the main state, but for this simpler version 
        // we'll just display it. In a real app, dispatch an update action here.
        setLoading(false);
      };
      fetchReading();
    }
  }, [card]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-rose-200 relative animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-rose-100 p-4 flex justify-between items-center border-b border-rose-200">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-lg">
            {isNewUnlock ? <Sparkles className="w-5 h-5 text-yellow-500 animate-spin-slow" /> : null}
            {isNewUnlock ? "Destiny Unlocked!" : "Card Memory"}
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-rose-200 rounded-full transition-colors text-rose-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-300 to-orange-200 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <img 
              src={`https://picsum.photos/seed/${card.seed}/300/450`} 
              alt={card.name} 
              className="relative w-48 h-72 object-cover rounded-lg shadow-lg border-2 border-white"
            />
          </div>
          
          <h2 className="text-2xl font-serif text-rose-900 font-bold">{card.name}</h2>
          
          <div className="w-full bg-rose-50 p-4 rounded-xl min-h-[100px] border border-rose-100">
            {loading ? (
              <div className="flex items-center justify-center h-full gap-2 text-rose-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm italic">Consulting the stars...</span>
              </div>
            ) : (
              <p className="text-rose-800 font-medium text-center italic font-serif leading-relaxed">
                "{reading}"
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-rose-50 text-center">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-rose-400 hover:bg-rose-500 text-white rounded-full font-bold shadow-md transition-transform hover:scale-105 active:scale-95"
            >
                Keep this Card
            </button>
        </div>

      </div>
    </div>
  );
};

export default TarotModal;