import { Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { supabase } from "./config/env";
import { AuthContext } from "./context/userContext";
import RoleBasedNavigation from "./components/RoleBasedNavigation";
import "./style/App.css";

function App() {
  const { login, setUser, setUserProfile, setInstitute, setUserRole } =
    useContext(AuthContext);
  const navigation = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval;
    const fetchUser = async () => {
      setLoading(true);
      setProgress(0);
      setLoadingError(false);

      progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + Math.random() * 10 : prev));
      }, 50);

      const { data, error } = await supabase.auth.getUser();
      console.log("🔍 Auth data:", data);

      if (data?.user) {
        login(data.user);
        console.log("✅ User authenticated:", data.user.id);

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
          console.log("👨‍🎓 Student profile found:", studentData);
          setUser(studentData);
          setUserProfile(studentData);
          setInstitute(studentData.institutes);
          setUserRole("student");
          setProgress(100);
          setTimeout(() => setLoading(false), 50);
          clearInterval(progressInterval);
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
          console.log("👨‍💼 Staff profile found:", staffData);
          setUser(staffData);
          setUserProfile(staffData);
          setInstitute(staffData.institutes);
          setUserRole("staff");
          setProgress(100);
          setTimeout(() => setLoading(false), 50);
          clearInterval(progressInterval);
          return;
        }

        // If user is not found in either table
        console.error("❌ User not found in students or staff tables");
        console.error("Student error:", studentError);
        console.error("Staff error:", staffError);
        setLoadingError(true);
        setLoading(false);
        clearInterval(progressInterval);
      } else {
        setLoading(false);
        clearInterval(progressInterval);
        navigation("/login");
        console.error("❌ Error fetching user:", error);
      }
    };
    fetchUser();

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, []);

  if (loadingError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Account Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Your account is not set up yet. Please contact your administrator to
            add you to the system.
          </p>
          <button
            onClick={() => {
              supabase.auth.signOut();
              navigation("/login");
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-all">
          <h1 className="text-4xl font-black mb-4 tracking-wide flex">
            {["M", "E", "d", "u", "c", "a", "t", "i", "o", "n"].map(
              (letter, index) => {
                const letterProgress = (index + 1) * 10;
                const isFilled = progress >= letterProgress;
                return (
                  <span
                    key={index}
                    className={`transition-colors duration-300 ${
                      isFilled ? "text-blue-600" : "text-zinc-200"
                    }`}
                    style={{ letterSpacing: "0.05em" }}
                  >
                    {letter}
                  </span>
                );
              }
            )}
          </h1>
        </div>
      )}

      <div className="w-full h-screen">
        {/* Navigation */}
        <RoleBasedNavigation />

        {/* Main content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
