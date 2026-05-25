"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { createContext, useContext } from "react";
import { Session } from "next-auth";

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "unauthenticated",
  isAuthenticated: false,
  isAdmin: false,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const logout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        status,
        isAuthenticated,
        isAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}