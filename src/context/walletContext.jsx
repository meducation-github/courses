import { useState } from "react";
import PropTypes from "prop-types";
import { WalletContext } from "./contexts";

export const WalletProvider = ({ children }) => {
  const [walletState, setWalletState] = useState([]);

  const setWallet = (wallet) => {
    setWalletState(wallet);
  };

  return (
    <WalletContext.Provider
      value={{
        walletState,
        setWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

WalletProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
