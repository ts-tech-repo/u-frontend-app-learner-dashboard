import React, { createContext, useContext, useState } from 'react';

const ActiveTabContext = createContext();

export const useActiveTab = () => useContext(ActiveTabContext);

export const ActiveTabProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ActiveTabContext.Provider>
  );
}; 