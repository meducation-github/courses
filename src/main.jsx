// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./style/index.css";
import App from "./App.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ContextProvider } from "./context/index.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Courses from "./pages/courses/index.jsx";
import CreateCourses from "./pages/create-courses/index.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ContextProvider>
      <Routes>
        <Route path="/" element={<App />}>
          {/* Staff-only routes for creating courses */}
          <Route
            path="/create-courses"
            element={
              <ProtectedRoute requiredRole="staff">
                <CreateCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-courses/:courseId"
            element={
              <ProtectedRoute requiredRole="staff">
                <CreateCourses />
              </ProtectedRoute>
            }
          />

          {/* Student and Staff routes for viewing courses */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/units/:unitId"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/units/:unitId/topics/:topicId"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/units/:unitId/topics/:topicId/subtopics/:subtopicId"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </ContextProvider>
  </BrowserRouter>
);
