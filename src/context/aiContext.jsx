import { useState } from "react";
import PropTypes from "prop-types";
import { AiContext } from "./contexts";

export const AiProvider = ({ children }) => {
  const [aiState, setAiState] = useState([]);

  const setAi = (user) => {
    setAiState(user);
  };

  return (
    <AiContext.Provider
      value={{
        aiState,
        setAi,
      }}
    >
      {children}
    </AiContext.Provider>
  );
};

AiProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
