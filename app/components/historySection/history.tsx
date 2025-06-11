import React, { memo } from 'react';
import styles from './history.module.css';
import { useAudio } from '@/app/context/AudioContext';

/**
 * Determines the color class for the score badge based on the score value
 * @param score - The numerical score to evaluate
 * @returns {'green' | 'yellow' | 'red'} Color class based on score range
 */
const getColorClass = (score: number): 'green' | 'yellow' | 'red' => {
  if (score >= 80) return 'green';    // High score: >= 80
  if (score >= 60) return 'yellow';   // Medium score: 60-79
  return 'red';                       // Low score: < 60
}

/**
 * HistorySection Component
 * 
 * Displays a table of historical call analysis results with scores.
 * Each entry shows the date, filename, and color-coded score.
 * 
 * @component
 * @returns {React.ReactElement} A table of historical analysis results
 */
const HistorySection: React.FC = () => {
  const {history: historyData} = useAudio();
  
  return (
    <>
      {historyData?.length ? (
        // Display history table when data is available
        <div className={styles.container}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.headerRow}>
                  <th className={styles.thLeft}>Date</th>
                  <th className={styles.thLeft}>File Name</th>
                  <th className={styles.thCenter}>Score</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map(({ scoreResult, uploadDate, fileName }, index) => (
                  <tr key={index} className={styles.bodyRow}>
                    <td className={styles.tdLeft}>
                      {new Date(uploadDate).toLocaleDateString('en-IN', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className={styles.tdLeft}>{fileName}</td>
                    <td className={`${styles.tdCenter} ${styles.scoreCell}`}>
                      <span className={`${styles.scoreBadge} ${styles[getColorClass(scoreResult.totalScore)]}`}>
                        {scoreResult.totalScore}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Display message when no history is available
        <div className={styles.wrapper}>
          <h4 className={styles.nohistory}>No History Available</h4>
        </div>
      )}
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(HistorySection);
