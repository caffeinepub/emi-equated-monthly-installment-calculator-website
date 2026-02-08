import { useState, useEffect } from 'react';

const STORAGE_KEY = 'emi-calculation-history-v1';
const MAX_HISTORY_ITEMS = 50;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  principal: number;
  annualInterestRate: number;
  tenureMonths: number;
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
}

interface HistoryState {
  entries: HistoryEntry[];
}

/**
 * Custom hook for managing EMI calculation history with localStorage persistence.
 * Provides APIs to add, load, and clear history entries.
 */
export function useEmiCalculationHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: HistoryState = JSON.parse(stored);
        if (Array.isArray(parsed.entries)) {
          setHistory(parsed.entries);
        }
      }
    } catch (error) {
      console.error('Failed to load history from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        const state: HistoryState = { entries: history };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save history to localStorage:', error);
      }
    }
  }, [history, isLoading]);

  /**
   * Add a new calculation to history (newest first)
   */
  const addEntry = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const updated = [newEntry, ...prev];
      // Keep only the most recent MAX_HISTORY_ITEMS
      return updated.slice(0, MAX_HISTORY_ITEMS);
    });
  };

  /**
   * Clear all history entries
   */
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history from localStorage:', error);
    }
  };

  /**
   * Get a specific entry by ID
   */
  const getEntry = (id: string): HistoryEntry | undefined => {
    return history.find((entry) => entry.id === id);
  };

  return {
    history,
    isLoading,
    addEntry,
    clearHistory,
    getEntry,
  };
}
