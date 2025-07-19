// src/context/AwsContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const AwsContext = createContext();

const initialAwsState = {
  accessKeyId: '',
  secretAccessKey: '',
  bucket: '',
  region: '',
};

export const AwsContextProvider = ({ children }) => {
  const [aws, setAws] = useState(() => {
    const stored = localStorage.getItem('s3Credentials');
    return stored ? JSON.parse(stored) : initialAwsState;
  });

  // Persist to localStorage when aws updates
  useEffect(() => {
    if (
      aws &&
      aws.accessKeyId &&
      aws.secretAccessKey &&
      aws.bucket &&
      aws.region
    ) {
      localStorage.setItem('s3Credentials', JSON.stringify(aws));
    } else {
      localStorage.removeItem('s3Credentials');
    }
  }, [aws]);

  // Disconnect method
  const disconnectAws = () => {
    localStorage.removeItem('s3Credentials');
    setAws(initialAwsState);
  };

  return (
    <AwsContext.Provider value={{ aws, setAws, disconnectAws }}>
      {children}
    </AwsContext.Provider>
  );
};

// Custom hook
export const useAws = () => useContext(AwsContext);
