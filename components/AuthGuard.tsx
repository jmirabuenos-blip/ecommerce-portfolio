"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { isAuthenticated, isAdmin, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, isAdmin, status, requireAdmin, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (requireAdmin && !isAdmin) return null;

  return <>{children}</>;
}