'use client';

import React, { memo } from 'react';
import styles from './result.module.css';
import ScoreCard from '../scoreCard/scoreCard';
import { Scores, useAudio } from '@/app/context/AudioContext';

// Configuration for different scoring criteria and their weights
const ScoreCardDetails : {
    key: keyof Scores;
    name: string;
    weight: number;
    desc: string;
    inputType: string;
}[]  = [
  // Basic call handling metrics
  { key: "greeting", name: "Greeting", weight: 5, desc: "Call opening within 5 seconds", inputType: "PASS_FAIL" },
  { key: "collectionUrgency", name: "Collection Urgency", weight: 15, desc: "Create urgency, cross-questioning", inputType: "SCORE" },
  { key: "rebuttalCustomerHandling", name: "Rebuttal Handling", weight: 15, desc: "Address penalties, objections", inputType: "SCORE" },
  { key: "callEtiquette", name: "Call Etiquette", weight: 15, desc: "Tone, empathy, clear speech", inputType: "SCORE" },
  
  // Call compliance metrics
  { key: "callDisclaimer", name: "Call Disclaimer", weight: 5, desc: "Take permission before ending", inputType: "PASS_FAIL" },
  { key: "correctDisposition", name: "Correct Disposition", weight: 10, desc: "Use correct category with remark", inputType: "PASS_FAIL" },
  { key: "callClosing", name: "Call Closing", weight: 5, desc: "Thank the customer properly", inputType: "PASS_FAIL" },
  
  // Critical compliance metrics
  { key: "fatalIdentification", name: "Identification", weight: 5, desc: "Missing agent/customer info", inputType: "PASS_FAIL" },
  { key: "fatalTapeDiscloser", name: "Tape Disclosure", weight: 10, desc: "Inform customer about recording", inputType: "PASS_FAIL" },
  { key: "fatalToneLanguage", name: "Tone & Language", weight: 15, desc: "No abusive or threatening speech", inputType: "PASS_FAIL" }
];

// ResultSection component displays the analysis results or a prompt to upload
const ResultSection: React.FC = () => {
  const { result, setActiveTab } = useAudio();
  return (
    <>
      {result ? (
        // Display results when available
        <div>
          {/* Total score display */}
          <div className={styles.totalScoreContainer}>
            <div className={styles.scoreCircle}>
              <span id="total-score" className={styles.totalScore}>{result?.totalScore}</span>
              <span className={styles.scoreSuffix}>/10</span>
            </div>
            <div className={styles.totalScoreLabel}>Your Score</div>
          </div>

          {/* Individual score cards */}
          <div className={styles.scoreCardContainer}>
            {ScoreCardDetails.map((score, index) => (
              <ScoreCard
                key={index}
                title={score.name}
                score={result?.scores[score.key] || 0}
                maxScore={score.weight}
                comment={score.desc}
              />
            ))}
          </div>
        </div>

      ) : (
        // Display upload prompt when no results available
        <div className={styles.noResultContainer}>
          <svg
            className={styles.noResultIcon}
            fill="none"
            width={56}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3>No Results Found</h3>
          <p>
            Upload and analyze an audio file to see your scoring results here
          </p>
          <button className={styles.noResultButton} onClick={() => {setActiveTab('upload')}}>
            Go to Upload
          </button>
        </div>
      )}
    </>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ResultSection);
