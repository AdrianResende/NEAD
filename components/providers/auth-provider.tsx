"use client";

type AuthProviderProps = {
  children: React.ReactNode;
  session?: null;
};

export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}
