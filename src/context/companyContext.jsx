import { useState } from "react";
import PropTypes from "prop-types";
import { CompanyContext } from "./contexts";

export const CompanyProvider = ({ children }) => {
  const [companyState, setCompanyState] = useState([]);

  const setCompany = (user) => {
    setCompanyState(user);
  };

  return (
    <CompanyContext.Provider
      value={{
        companyState,
        setCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

CompanyProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
