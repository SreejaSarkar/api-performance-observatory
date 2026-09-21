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
        search,
    } = request.nextUrl;

    if (!isProtectedPath(pathname)) {
        return NextResponse.next();
    }

    const hasRefreshToken =
        Boolean(
            request.cookies.get(
                "refresh_token",
            )?.value,
        );

    if (hasRefreshToken) {
        return NextResponse.next();
    }

    const loginUrl = new URL(
        "/auth/login",
        request.url,
    );

    loginUrl.searchParams.set(
        "next",
        `${pathname}${search}`,
    );

    return NextResponse.redirect(
        loginUrl,
    );
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