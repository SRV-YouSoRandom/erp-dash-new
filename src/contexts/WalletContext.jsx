import React, { createContext, useState, useContext } from 'react';

const WalletContext = createContext();

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetWallet = () => {
    setWallet(null);
    setAddress('');
    setBalance(null);
    setError('');
  };

  const value = {
    wallet,
    setWallet,
    address,
    setAddress,
    balance,
    setBalance,
    loading,
    setLoading,
    error,
    setError,
    resetWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}