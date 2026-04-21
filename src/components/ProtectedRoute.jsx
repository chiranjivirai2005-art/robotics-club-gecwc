"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/",
  unauthenticatedRedirectTo = "/login",
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace(unauthenticatedRedirectTo);
      return;
    }

    if (Array.isArray(allowedRoles) && !allowedRoles.includes(role)) {
      router.replace(redirectTo);
    }
  }, [allowedRoles, loading, redirectTo, role, router, unauthenticatedRedirectTo, user]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!user) return null;

  if (Array.isArray(allowedRoles) && !allowedRoles.includes(role)) {
    return null;
  }

  return children;
}
