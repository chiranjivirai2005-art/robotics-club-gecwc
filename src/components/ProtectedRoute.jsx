"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (Array.isArray(allowedRoles) && !allowedRoles.includes(role)) {
      router.replace("/");
    }
  }, [allowedRoles, loading, role, router, user]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return children;
}
