'use client';
import { memo } from 'react';
import styles from './tabs.module.css';
import { useAudio } from '@/app/context/AudioContext';

// Interface for individual tab items
interface Tab {
  id: string;   // Unique identifier for the tab
  label: string; // Display text for the tab
}

// Props interface for the Tabs component
interface TabsProps {
  tabs: Tab[]; // Array of tab configurations
}

/**
 * Tabs Component
 * Renders a horizontal tab navigation with active state management
 * 
 * @param {TabsProps} props - The props for the Tabs component
 * @returns {React.ReactElement} A tab navigation component
 */
const Tabs = function({ tabs }: TabsProps) {
  const {activeTab, setActiveTab} = useAudio();

  return (
    <div className={styles.tabContainer}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => setActiveTab(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
          tabIndex={0}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(Tabs);