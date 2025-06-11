import React from 'react';
import styles from './history.module.css';
import { useAudio } from '@/app/context/AudioContext';

const getColorClass = (score: number): 'green' | 'yellow' | 'red' => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}


const HistorySection: React.FC = () => {
  const {history : historyData} = useAudio();
  
  return (
    <>
      {historyData?.length ? (
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
                  <td className={styles.tdLeft}>{new Date(uploadDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
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
      ): (
        <div className={styles.wrapper}>
          <h4 className={styles.nohistory}>No History Available</h4>
        </div>
      )}
    </>

  );
};

export default HistorySection;
