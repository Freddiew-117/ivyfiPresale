import React, { createContext, useContext, useState } from 'react';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const [tokenSale, setTokenSale] = useState({
    tokenSold: 0,
    tokenSaleBalance: 0,
    presaleStatus: false,
    tokenPrice: 0,
    tokensForSale: 0
  });

  // Add other state variables you need
  const [address, setAddress] = useState('');
  const [currentHolder, setCurrentHolder] = useState(null);
  const [tokenHolders, setTokenHolders] = useState([]);
  const [nativeToken, setNativeToken] = useState(null);
  const [balance, setBalance] = useState(0);
  const [TOKEN_ICO, setTOKEN_ICO] = useState(null);

  const buyToken = async () => {
    // Implement your buy token logic
    console.log('Buy token functionality');
  };

  const connectWallet = async () => {
    // Implement your connect wallet logic
    console.log('Connect wallet functionality');
  };

  const transferNativeToken = async () => {
    // Implement transfer logic
    console.log('Transfer token functionality');
  };

  return (
    <StateContext.Provider
      value={{
        buyToken,
        connectWallet,
        setAddress,
        currentHolder,
        tokenSale,
        tokenHolders,
        nativeToken,
        balance,
        address,
        TOKEN_ICO,
        transferNativeToken
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useStateContext must be used within a StateContextProvider');
  }
  return context;
};