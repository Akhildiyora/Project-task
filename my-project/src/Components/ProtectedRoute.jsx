import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserDataContext } from '../Context/UserDataContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useUserDataContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (requiredRole && user.role !== requiredRole) {
        navigate("/dashboard");
      }
    }
  }, [user, loading, navigate, requiredRole]);

  if (loading) {
    return <div className="h-screen bg-zinc-900 flex items-center justify-center text-white text-xl">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return children;
}

export default ProtectedRoute;