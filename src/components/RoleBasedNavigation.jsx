import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RoleBasedNavigation = () => {
  const { userRole, canCreateCourses, userProfile, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              to="/courses"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/courses") || location.pathname === "/"
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Courses
            </Link>

            {canCreateCourses() && (
              <Link
                to="/create-courses"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/create-courses")
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                Create Courses
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">
              {userRole === "student" ? "Student Portal" : "Staff Portal"}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">
                {userProfile?.first_name && userProfile?.last_name
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : userProfile?.name || "User"}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;
