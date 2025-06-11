'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ScoreResult {
  scores: Scores;
  totalScore: number;
  overallFeedback: string
  observation: string
}

interface ScoreApiResponse {
  scores: Scores;
  overallFeedback: string
  observation: string
}

export interface Scores {
  greeting: number
  collectionUrgency: number
  rebuttalCustomerHandling: number
  callEtiquette: number
  callDisclaimer: number
  correctDisposition: number
  callClosing: number
  fatalIdentification: number
  fatalTapeDiscloser: number
  fatalToneLanguage: number
}

export interface HistoryItem {
  scoreResult: ScoreResult;
  fileName: string;
  uploadDate: Date;
  totalScore: number;
}

type AudioContextType = {
  selectedFile: File | null;
  audioURL: string | null;
  result: ScoreResult | null;
  history: HistoryItem[];
  activeTab : string;
  setSelectedFile: (file: File | null) => void;
  setAudioURL: (url: string | null) => void;
  setResult: (res: ScoreApiResponse | null) => void;
  resetFile: () => void;
  setActiveTab: (tabId: string) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('upload'); // Default active tab
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [result, setResultState] = useState<ScoreResult | null>(null);
  const [history, setHistoryState] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("history");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const setResult = (apiResponse: ScoreApiResponse | null ) => {
    if(!apiResponse || !apiResponse.scores) {
      console.error("Invalid score result provided to setResult");
      return;
    }
    const fileName = selectedFile?.name || "Unknown";
    const totalScore = Object.values(apiResponse.scores).reduce((acc, score) => acc + score, 0);
    const newResult: ScoreResult = {...apiResponse, totalScore }
    setResultState(newResult);

    setHistoryState((prevHistory) => {
      const updatedHistory = [...prevHistory, {
        scoreResult: newResult,
        fileName,
        uploadDate: new Date(),
        totalScore: newResult.totalScore
      }].slice(-10);
      // Limit history to last 10 items
      if (typeof window !== 'undefined') {
        localStorage.setItem("history", JSON.stringify(updatedHistory));
      }
      return updatedHistory;
    });

    setActiveTab('results');
    setSelectedFile(null);
    setAudioURL(null);
    
  };

  const resetFile = () => {
    setSelectedFile(null);
    setAudioURL(null);
    setResultState(null);
  };

  return (
    <AudioContext.Provider
      value={{
        selectedFile,
        audioURL,
        result,
        history,
        activeTab, 
        setActiveTab,
        setSelectedFile,
        setAudioURL,
        setResult,
        resetFile
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
