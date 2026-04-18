import React from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { CuitSelector } from './components/CuitSelector';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const { jwt, jwtc } = useAuth();

  if (!jwt) {
    return <Login />;
  }

  if (jwt && !jwtc) {
    return <CuitSelector />;
  }

  return <Dashboard />;
}

