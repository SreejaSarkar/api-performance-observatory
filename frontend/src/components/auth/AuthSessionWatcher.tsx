"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useAuthSession } from "@/components/auth/AuthSessionProvider";

const protectedPaths = [
    "/projects",
    "/dashboard",
    "/alerts",
    "/anomalies",
    "/reports",
    "/webhooks",
    "/endpoints",
];

function isProtectedPath(pathname: string) {
    return protectedPaths.some(
        (path) =>
            pathname === path ||
            pathname.startsWith(
                `${path}/`,
            ),
    );
}

export default function AuthSessionWatcher() {
    const pathname = usePathname();
    const { refreshSession } = useAuthSession();

    useEffect(() => {
        if (!isProtectedPath(pathname)) {
            return;
        }

        let cancelled = false;

        const checkSession = async () => {
            try {
                await refreshSession(true);
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(error);
            }
        };

        const handleFocus = () => {
            void checkSession();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                void checkSession();
            }
        };

        void checkSession();

        const intervalId = window.setInterval(() => {
            void checkSession();
        }, 60_000);

        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [pathname, refreshSession]);

    return null;
}