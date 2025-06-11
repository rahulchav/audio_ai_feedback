import React from 'react';
import styles from './page.module.css';
import MainPage from './components/mainPage/mainpage';
import { AudioProvider } from './context/AudioContext';

export default function LayoutWrapper() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>AI Audio Scoring System</h1>
        <p>Upload your audio file for instant AI feedback and scoring</p>
      </header>
      <div className={styles.mainCard}>
          <AudioProvider>
            <MainPage /> 
          </AudioProvider>
      </div>
    </div>
  );
}
