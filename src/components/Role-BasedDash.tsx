import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdminDashboard from "../pages/dashboard/AdminDashboardPage";
import InstructorDashboard from "..//pages/dashboard/InstructorDash";
import UserDashboard from "../pages/dashboard/UserDashboardPage";
import { ROLES } from "../constants/roles";

const RoleBasedDashboard = () => {
  const { currentUser, getUserRole } = useAuth();

  if (!currentUser) return <Navigate to="/" replace />;

  const role = getUserRole();

  switch (role) {
    case ROLES.ADMIN:
      return <AdminDashboard />;
    case ROLES.INSTRUCTOR:
      return <InstructorDashboard />;
    default:
      return <UserDashboard />;
  }
};

export default RoleBasedDashboard;
