import { AiProvider } from "./aiContext";
import { CompanyProvider } from "./companyContext";
import { Context } from "./contexts";
import { UserProvider } from "./userContext";
import PropTypes from "prop-types";
import { WalletProvider } from "./walletContext";
import { PlanProvider } from "./planContext";
import { UserGuideProvider } from "./userGuideContext";

export const ContextProvider = ({ children }) => {
  return (
    <Context.Provider value={{}}>
      <UserProvider>
        <CompanyProvider>
          <AiProvider>
            <PlanProvider>
              <UserGuideProvider>
                <WalletProvider>{children}</WalletProvider>
              </UserGuideProvider>
            </PlanProvider>
          </AiProvider>
        </CompanyProvider>
      </UserProvider>
    </Context.Provider>
  );
};

ContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
