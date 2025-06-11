'use client';

import React, { memo } from 'react';
import Tabs from '../tabs/tabs';
import UploadSection from '../upload/upload';
import ResultSection from '../resultSection/resultSection';
import HistorySection from '../historySection/history';
import { useAudio } from '@/app/context/AudioContext';

/**
 * MainPage Component
 * 
 * The main container component that manages the tab-based navigation between
 * upload, results, and history sections. Uses the AudioContext for state management.
 * 
 * @component
 * @returns {React.ReactElement} The main page layout with tab navigation
 */
const MainPage = function() {
  const {activeTab} = useAudio();

  // Tab configuration for the main navigation
  const tabs = [
    { id: 'upload', label: 'Upload' },     // Audio file upload section
    { id: 'results', label: 'Results' },   // Analysis results section
    { id: 'history', label: 'History' },   // Historical records section
  ];

  return (
    <div>
      {/* Tab navigation */}
      <Tabs tabs={tabs} />

      {/* Conditional rendering of sections based on active tab */}
      {activeTab === 'upload' && <UploadSection />}
      {activeTab === 'results' && <ResultSection />}
      {activeTab === 'history' && <HistorySection />}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(MainPage);
