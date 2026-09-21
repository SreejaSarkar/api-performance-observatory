import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

export function proxy(
    request: NextRequest,
) {
    const {
        pathname,
    } = request.nextUrl;

    if (!isProtectedPath(pathname)) {
        return NextResponse.next();
    }

    // In production the auth cookies belong to the backend origin,
    // so the frontend proxy cannot reliably inspect them.
    // Let the client validate the session through /auth/me.
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/projects/:path*",
        "/dashboard/:path*",
        "/alerts/:path*",
        "/anomalies/:path*",
        "/reports/:path*",
        "/webhooks/:path*",
        "/endpoints/:path*",
    ],
};