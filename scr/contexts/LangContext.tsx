
import React, { createContext, useContext, useState, useEffect } from "react";
import ar from "../lib/i18n/ar";

export type LangContextType = {
  t: (key: string) => string;
  isRTL: boolean;
  toggleDirection: () => void;
};

const defaultContext: LangContextType = {
  t: (key: string) => key,
  isRTL: true, // Default to RTL for Arabic
  toggleDirection: () => {},
};

const LangContext = createContext<LangContextType>(defaultContext);

export const useLang = () => useContext(LangContext);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRTL, setIsRTL] = useState<boolean>(true); // Default to RTL for Arabic

  // Function to translate keys to Arabic
  const t = (key: string): string => {
    return ar[key as keyof typeof ar] || key;
  };

  // Toggle direction function
  const toggleDirection = () => {
    setIsRTL(!isRTL);
  };

  // Set direction on the document
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", isRTL);
  }, [isRTL]);

  return (
    <LangContext.Provider value={{ t, isRTL, toggleDirection }}>
      {children}
    </LangContext.Provider>
  );
};

export default LangProvider;
