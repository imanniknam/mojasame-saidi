"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NavUser } from "@/components/layout/site-header";
import { fetchSessionUser } from "@/lib/auth/session-client";

const SESSION_CHANGED = "mojasame:session-changed";

type SessionContextValue = {
  user: NavUser | null;
  loading: boolean;
  refresh: (options?: { clearIfMissing?: boolean }) => Promise<NavUser | null>;
  setUser: (user: NavUser | null) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function notifySessionChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_CHANGED));
  }
}

export function SessionProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: NavUser | null;
}) {
  const [user, setUser] = useState<NavUser | null>(initialUser);
  const [loading, setLoading] = useState(initialUser == null);

  useEffect(() => {
    setUser(initialUser);
    if (initialUser) {
      setLoading(false);
    }
  }, [initialUser]);

  const refresh = useCallback(async (options?: { clearIfMissing?: boolean }) => {
    const next = await fetchSessionUser();
    if (next) {
      setUser(next);
    } else if (options?.clearIfMissing) {
      setUser(null);
    }
    setLoading(false);
    return next;
  }, []);

  useEffect(() => {
    void refresh();

    const onChange = () => void refresh({ clearIfMissing: true });
    window.addEventListener(SESSION_CHANGED, onChange);
    return () => window.removeEventListener(SESSION_CHANGED, onChange);
  }, [refresh]);

  const value = useMemo(
    () => ({ user, loading, refresh, setUser }),
    [user, loading, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
