import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  jwt: string | null;
  jwtc: string | null;
  selectedCuit: any | null;
  cachedCuits: any[] | null;
  setJwt: (token: string | null) => void;
  setJwtc: (token: string | null) => void;
  setSelectedCuit: (cuit: any | null) => void;
  setCachedCuits: (cuits: any[] | null) => void;
  logout: () => void;
  clearCuitSelection: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jwt, setJwtState] = useState<string | null>(() => localStorage.getItem('sos_jwt'));
  const [jwtc, setJwtcState] = useState<string | null>(() => localStorage.getItem('sos_jwtc'));
  const [selectedCuit, setSelectedCuitState] = useState<any | null>(() => {
    const saved = localStorage.getItem('sos_selected_cuit');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [cachedCuits, setCachedCuitsState] = useState<any[] | null>(() => {
    const saved = localStorage.getItem('sos_cached_cuits');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setJwt = (token: string | null) => {
    setJwtState(token);
    if (token) localStorage.setItem('sos_jwt', token);
    else localStorage.removeItem('sos_jwt');
  };

  const setJwtc = (token: string | null) => {
    setJwtcState(token);
    if (token) localStorage.setItem('sos_jwtc', token);
    else localStorage.removeItem('sos_jwtc');
  };

  const setSelectedCuit = (cuit: any | null) => {
    setSelectedCuitState(cuit);
    if (cuit) localStorage.setItem('sos_selected_cuit', JSON.stringify(cuit));
    else localStorage.removeItem('sos_selected_cuit');
  };

  const setCachedCuits = (cuits: any[] | null) => {
    setCachedCuitsState(cuits);
    if (cuits) localStorage.setItem('sos_cached_cuits', JSON.stringify(cuits));
    else localStorage.removeItem('sos_cached_cuits');
  };

  const logout = () => {
    setJwt(null);
    setJwtc(null);
    setSelectedCuit(null);
    setCachedCuits(null);
  };

  const clearCuitSelection = () => {
    setJwtc(null);
    setSelectedCuit(null);
  };

  return (
    <AuthContext.Provider value={{ jwt, jwtc, selectedCuit, cachedCuits, setJwt, setJwtc, setSelectedCuit, setCachedCuits, logout, clearCuitSelection }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
