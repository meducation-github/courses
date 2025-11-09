import { Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { supabase } from "./config/env";
import { AuthContext } from "./context/userContext";
import LoadingSpinner from "./components/LoadingSpinner";
import RoleBasedNavigation from "./components/RoleBasedNavigation";
import LoginButton from "./components/LoginButton";
import WelcomeMessage from "./components/WelcomeMessage";
import "./style/App.css";

function App() {
  const { login, setUserProfile, setInstitute, setUserRole, user, userRole } =
    useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      const { data, error } = await supabase.auth.getUser();
      console.log("Auth data:", data);
      console.log("Current user state:", user);

      if (data?.user) {
        login(data.user);
        console.log("User ID:", data.user.id);

        // Check if user is a student
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select(
            `
            *,
            institutes (*)
          `
          )
          .eq("user_id", data.user.id)
          .single();

        if (studentData && !studentError) {
          console.log("Student profile found:", studentData);
          setUserProfile(studentData);
          setInstitute(studentData.institutes);
          setUserRole("student");
          console.log("Set userRole to: student");
          setLoading(false);
          return;
        }

        // Check if user is staff
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select(
            `
            *,
            institutes (*)
          `
          )
          .eq("user_id", data.user.id)
          .single();

        if (staffData && !staffError) {
          console.log("Staff profile found:", staffData);
          setUserProfile(staffData);
          setInstitute(staffData.institutes);
          setUserRole("staff");
          console.log("Set userRole to: staff");
          setLoading(false);
          return;
        }

        // If user is not found in either table
        console.error("User not found in students or staff tables");
        setLoading(false);
      } else {
        setLoading(false);
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-all">
        <h1
          className="text-4xl font-black text-blue-600 mb-4 tracking-wide"
          style={{ letterSpacing: "0.05em" }}
        >
          MEducation
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated, show login button
  if (!user || !userRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1
          className="text-4xl font-black text-blue-600 mb-8 tracking-wide"
          style={{ letterSpacing: "0.05em" }}
        >
          MEducation
        </h1>
        <LoginButton />
      </div>
    );
  }

  return (
    <div>
      <div className="w-full h-screen">
        {/* Navigation */}
        <RoleBasedNavigation />

        {/* Welcome Message */}
        <div className="px-4 py-2">
          <WelcomeMessage />
        </div>

        {/* Main content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
