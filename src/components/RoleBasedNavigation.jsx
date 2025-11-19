import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";

const RoleBasedNavigation = () => {
  const { userRole, canCreateCourses, userProfile, logout } = useAuth();
  const location = useLocation();

  // Hide the header when viewing or editing a specific course
  const shouldHideNavigation =
    /^\/courses\/[^/]+/i.test(location.pathname) ||
    /^\/create-courses\/[^/]+/i.test(location.pathname);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  if (shouldHideNavigation) return null;

  return (
    <nav className="relative bg-white/95 text-gray-900 border-b border-gray-200 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-6 h-auto py-3 sm:h-16 sm:py-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 text-blue-600 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              M
            </div>
            <span className="text-base sm:text-lg font-semibold text-gray-900 leading-none">
              MEd Courses
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none justify-center sm:justify-start w-full sm:w-auto">
            <Link
              to="/courses"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/courses") || location.pathname === "/"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Courses
            </Link>

            {canCreateCourses() && (
              <Link
                to="/create-courses"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/create-courses")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                Create Courses
              </Link>
            )}
            {userRole === "student" && (
              <Link
                to="/learning"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/learning")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                Learning
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <span className="font-medium">
                {userProfile?.first_name && userProfile?.last_name
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : userProfile?.name || "User"}
              </span>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                {userRole === "student" ? "Student" : "Staff"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;
