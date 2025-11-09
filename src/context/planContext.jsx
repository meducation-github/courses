import { useState } from "react";
import PropTypes from "prop-types";
import { PlanContext } from "./contexts";

export const PlanProvider = ({ children }) => {
  const [planState, setPlanState] = useState([]);

  const setPlan = (plan) => {
    setPlanState(plan);
  };

  return (
    <PlanContext.Provider
      value={{
        planState,
        setPlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

PlanProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
