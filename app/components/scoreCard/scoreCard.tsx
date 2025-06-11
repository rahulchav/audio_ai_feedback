import React, { useEffect, useState } from 'react';
import styles from './scoreCard.module.css';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  comment: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, maxScore, comment }) => {
  const [progress, setProgress] = useState(0);
  const percentage = (score / maxScore) * 100;

  useEffect(() => {
    // Animate from 0 to target percentage after mount
    const timeout = setTimeout(() => setProgress(percentage), 100);
    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h4 className={styles.title}>{title}</h4>
        <span className={styles.score}>
          {score}/{maxScore}
        </span>
      </div>

      <div className={styles.progressWrapper}>
        <div
          className={styles.progressBar}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className={styles.comment}>{comment}</p>
    </div>
  );
};

export default ScoreCard;
