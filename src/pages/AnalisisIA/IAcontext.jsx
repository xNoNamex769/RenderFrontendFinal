// IAContext.jsx
import React,{ createContext, useContext, useState } from "react";

const IAContext = createContext();

export function IAProvider({ children }) {
  const [recargarAnalisis, setRecargarAnalisis] = useState(false);

  return (
    <IAContext.Provider value={{ recargarAnalisis, setRecargarAnalisis }}>
      {children}
    </IAContext.Provider>
  );
}

export const useIA = () => useContext(IAContext);
