import { Difficulty, GameConfig, TarotCard } from './types';

export const DIFFICULTY_CONFIG: Record<Difficulty, GameConfig> = {
  [Difficulty.EASY]: { rows: 9, cols: 9, mines: 10 },
  [Difficulty.MEDIUM]: { rows: 16, cols: 16, mines: 40 },
  [Difficulty.HARD]: { rows: 16, cols: 30, mines: 99 },
};

// Mana/Undo System
export const MAX_UNDO_CHARGES = 3;
export const MANA_REGEN_TIME_MS = 30000; // 30 seconds per charge

export const TAROT_DECK_DATA: Omit<TarotCard, 'unlocked'>[] = [
  { id: 1, name: "The Fool", seed: 100, keywords: ["New beginnings", "Innocence", "Spontaneity"] },
  { id: 2, name: "The Magician", seed: 101, keywords: ["Manifestation", "Resourcefulness", "Power"] },
  { id: 3, name: "The High Priestess", seed: 102, keywords: ["Intuition", "Sacred knowledge", "Divine Feminine"] },
  { id: 4, name: "The Empress", seed: 103, keywords: ["Femininity", "Beauty", "Nature", "Abundance"] },
  { id: 5, name: "The Emperor", seed: 104, keywords: ["Authority", "Structure", "Control", "Fatherhood"] },
  { id: 6, name: "The Hierophant", seed: 105, keywords: ["Spiritual wisdom", "Tradition", "Conformity"] },
  { id: 7, name: "The Lovers", seed: 106, keywords: ["Love", "Harmony", "Relationships", "Values"] },
  { id: 8, name: "The Chariot", seed: 107, keywords: ["Control", "Willpower", "Success", "Action"] },
  { id: 9, name: "Strength", seed: 108, keywords: ["Strength", "Courage", "Persuasion", "Influence"] },
  { id: 10, name: "The Hermit", seed: 109, keywords: ["Soul-searching", "Introspection", "Being alone"] },
  { id: 11, name: "Wheel of Fortune", seed: 110, keywords: ["Good luck", "Karma", "Life cycles", "Destiny"] },
  { id: 12, name: "Justice", seed: 111, keywords: ["Justice", "Fairness", "Truth", "Cause and effect"] },
  { id: 13, name: "The Hanged Man", seed: 112, keywords: ["Pause", "Surrender", "Letting go", "New perspectives"] },
  { id: 14, name: "Death", seed: 113, keywords: ["Endings", "Change", "Transformation", "Transition"] },
  { id: 15, name: "Temperance", seed: 114, keywords: ["Balance", "Moderation", "Patience", "Purpose"] },
  { id: 16, name: "The Devil", seed: 115, keywords: ["Shadow self", "Attachment", "Addiction", "Restriction"] },
  { id: 17, name: "The Tower", seed: 116, keywords: ["Sudden change", "Upheaval", "Chaos", "Revelation"] },
  { id: 18, name: "The Star", seed: 117, keywords: ["Hope", "Faith", "Purpose", "Renewal"] },
  { id: 19, name: "The Moon", seed: 118, keywords: ["Illusion", "Fear", "Anxiety", "Subconscious"] },
  { id: 20, name: "The Sun", seed: 119, keywords: ["Positivity", "Fun", "Warmth", "Success"] },
  { id: 21, name: "Judgement", seed: 120, keywords: ["Judgement", "Rebirth", "Inner calling", "Absolution"] },
  { id: 22, name: "The World", seed: 121, keywords: ["Completion", "Integration", "Accomplishment", "Travel"] },
];