'use client';

import React, { useState, useRef, ChangeEvent, DragEvent, memo } from 'react';
import styles from './upload.module.css';
import { useAudio } from '@/app/context/AudioContext';

const UploadSection: React.FC = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { audioURL, selectedFile , setAudioURL, setSelectedFile, setResult } = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Please select a valid audio file');
      return;
    }

    setSelectedFile(file);
    setAudioURL(URL.createObjectURL(file));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handelFileProcess = async () => {

  if (!selectedFile) {
    console.warn('No file selected for processing.');
    return;
  }

  const formData = new FormData();
  formData.append('audio_file', selectedFile);
  setIsLoading(true);
  try {
    const response = await fetch('/api/analyze-call', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File analysis failed');
    }

    const result = await response.json();

    setResult(result);
  } catch (err) {
    console.error('Error during file processing:', err);
  } finally { 
    setIsLoading(false);
  }
};

  return (
    <div className={styles.containerdropzone}>
      <div
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <h3>Drop your audio file here</h3>
        <p>or click to browse</p>
        <p className={styles.subtext}>Supported formats: MP3, WAV</p>
      </div>

      <input
        type="file"
        accept="audio/*"
        ref={fileInputRef}
        className={styles.fileInput}
        onChange={onFileChange}
      />

      {selectedFile && audioURL && (
        <div className={styles.container}>
          <h3 className={styles.heading}>Preview</h3>
          <div className={styles.card}>
            <audio className={styles.audioPlayer} controls src={audioURL} />
            <p className={styles.fileName}>Selected file: {selectedFile?.name}</p>
            <div className={styles.buttonWrapper}>
              <button className="globalButton" onClick={() => handelFileProcess()}>
                {isLoading && <div className={styles.loader} />} {!isLoading ? 'Process' : 'Processing...'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(UploadSection);
