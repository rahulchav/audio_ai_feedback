import React, { memo, useEffect, useState } from 'react';
import styles from './scoreCard.module.css';

// Interface defining the required props for the ScoreCard component
interface ScoreCardProps {
  title: string;    // Title of the score metric
  score: number;    // Current score value
  maxScore: number; // Maximum possible score
  comment: string;  // Description or comment about the score
}

// ScoreCard component displays a score with an animated progress bar
const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, maxScore, comment }) => {
  // State to control the progress bar animation
  const [progress, setProgress] = useState(0);
  // Calculate the percentage score
  const percentage = (score / maxScore) * 100;

  useEffect(() => {
    // Add a small delay before animating to ensure smooth transition
    const timeout = setTimeout(() => setProgress(percentage), 100);
    // Cleanup timeout on unmount or when percentage changes
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

// Memoize the component to prevent unnecessary re-renders
export default memo(ScoreCard);
