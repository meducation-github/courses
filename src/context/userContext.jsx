import { useState, createContext } from "react";
import PropTypes from "prop-types";
import { supabase } from "../config/env";

export const AuthContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [institute, setInstitute] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const login = (authUser) => {
    setUser(authUser);
  };

  const logout = async () => {
    console.log("Logout called");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      } else {
        console.log("Successfully signed out");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    setUserProfile(null);
    setInstitute(null);
    setUserRole(null);
    console.log("User state cleared");
  };

  const redirectToLogin = () => {
    window.location.href = "https://meducation.pk/login";
  };

  const isStudent = () => userRole === "student";
  const isStaff = () => userRole === "staff";
  const canCreateCourses = () => userRole === "staff";

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        institute,
        userRole,
        login,
        logout,
        redirectToLogin,
        isStudent,
        isStaff,
        canCreateCourses,
        setUserProfile,
        setInstitute,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
