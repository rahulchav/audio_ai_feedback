'use client';

import React, { memo } from 'react';
import Tabs from '../tabs/tabs';
import UploadSection from '../upload/upload';
import ResultSection from '../resultSection/resultSection';
import HistorySection from '../historySection/history';
import { useAudio } from '@/app/context/AudioContext';
// import UploadSection from './components/UploadSection';
// import ResultsSection from './components/ResultsSection';
// import HistorySection from './components/HistorySection';

const MainPage = function() {
  const {activeTab} = useAudio();

  const tabs = [
    { id: 'upload', label: 'Upload' },
    { id: 'results', label: 'Results' },
    { id: 'history', label: 'History' },
  ];

  return (
      <div>
        <Tabs tabs={tabs} />

        {activeTab === 'upload' && <UploadSection />}
        {activeTab === 'results' && <ResultSection />}
        {activeTab === 'history' && <HistorySection />}
      </div>
  );
}

export default memo(MainPage);
