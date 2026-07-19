import { createContext, useState } from 'react';

export const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [currentVideoId, setCurrentVideoId] = useState(null);
  
  return (
    <VideoContext.Provider value={{ currentVideoId, setCurrentVideoId }}>
      {children}
    </VideoContext.Provider>
  );
};