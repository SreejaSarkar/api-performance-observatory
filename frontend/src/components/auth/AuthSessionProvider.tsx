"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { usePathname } from "next/navigation";

import {
    getCurrentUser,
    getCurrentUserOrNull,
    isSessionExpiredError,
} from "@/lib/auth-api";
import { User } from "@/types/user";

type AuthSessionContextValue = {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    refreshSession: (redirectOnUnauthorized?: boolean) => Promise<User | null>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSession = useCallback(
        async (redirectOnUnauthorized = false) => {
            try {
                const currentUser = redirectOnUnauthorized
                    ? await getCurrentUser()
                    : await getCurrentUserOrNull();

                setUser(currentUser);

                return currentUser;
            } catch (error) {
                if (isSessionExpiredError(error)) {
                    setUser(null);
                    return null;
                }

                throw error;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        let active = true;

        setLoading(true);

        void (async () => {
            try {
                const currentUser = await getCurrentUserOrNull();

                if (active) {
                    setUser(currentUser);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, [pathname]);

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: Boolean(user),
            refreshSession,
        }),
        [loading, refreshSession, user],
    );

    return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
    const context = useContext(AuthSessionContext);

    if (!context) {
        throw new Error("useAuthSession must be used within AuthSessionProvider");
    }

    return context;
}