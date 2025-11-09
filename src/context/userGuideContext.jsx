import { useState } from "react";
import PropTypes from "prop-types";
import { UserGuideContext } from "./contexts";

export const UserGuideProvider = ({ children }) => {
  const [userGuideState, setUserGuideState] = useState({
    knowledge_base: false,
    phone_number: false,
    calendar_integration: false,
    playground: false,
  });

  const setUserGuide = (step) => {
    setUserGuideState((prevState) => ({
      ...prevState,
      [step]: true,
    }));
  };

  return (
    <UserGuideContext.Provider
      value={{
        userGuideState,
        setUserGuide,
        setUserGuideState,
      }}
    >
      {children}
    </UserGuideContext.Provider>
  );
};

UserGuideProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
