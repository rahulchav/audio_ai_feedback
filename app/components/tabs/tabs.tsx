'use client';
import styles from './tabs.module.css';
import { useAudio } from '@/app/context/AudioContext';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
}

export default function Tabs({ tabs }: TabsProps) {
  const {activeTab , setActiveTab} = useAudio();

  return (
    <div className={styles.tabContainer}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}
