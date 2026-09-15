import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";

import CreateConsultationPage from "../pages/CreateConsultationPage";
import ConsultationPage from "../pages/ConsultationPage";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />


        <Route
          path="/consultations/new"
          element={<CreateConsultationPage />}
        />

        <Route
          path="/consultations/:consultationId"
          element={<ConsultationPage />}
        />
      </Route>
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;