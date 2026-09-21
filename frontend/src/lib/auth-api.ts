import { User }
    from "@/types/user";
import { clearSelectedProject }
    from "@/lib/selected-project";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001";

type AuthPayload = {
    email: string;
    password: string;
    name?: string;
};

type AuthRequestOptions = {
    retryOnUnauthorized?: boolean;
    redirectOnUnauthorized?: boolean;
};

type AuthProviders = {
    google: boolean;
    github: boolean;
};

export class SessionExpiredError extends Error {
    constructor() {
        super("Session expired");
        this.name = "SessionExpiredError";
    }
}

export function isSessionExpiredError(
    error: unknown,
) {
    return error instanceof SessionExpiredError;
}

function buildLoginRedirectUrl() {
    if (typeof window === "undefined") {
        return "/auth/login";
    }

    const loginUrl = new URL(
        "/auth/login",
        window.location.origin,
    );

    const nextPath = `${window.location.pathname}${window.location.search}`;

    if (
        nextPath.startsWith("/") &&
        !nextPath.startsWith("/auth/")
    ) {
        loginUrl.searchParams.set(
            "next",
            nextPath,
        );
    }

    return loginUrl.toString();
}

function redirectToLogin() {
    clearSelectedProject();

    if (typeof window !== "undefined") {
        window.location.assign(
            buildLoginRedirectUrl(),
        );
    }
}

async function refreshSession() {
    const response = await fetch(
        `${API_URL}/auth/refresh`,
        {
            method: "POST",
            credentials: "include",
        },
    );

    if (!response.ok) {
        throw new SessionExpiredError();
    }
}

async function parseJson(
    response: Response,
) {
    const data =
        await response
            .json()
            .catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.message ||
            "Request failed",
        );
    }

    return data;
}

async function authRequest(
    path: string,
    init?: RequestInit,
    options?: AuthRequestOptions,
) {
    let response =
        await fetch(
            `${API_URL}${path}`,
            {
                ...init,
                credentials:
                    "include",
                headers: {
                    "Content-Type":
                        "application/json",
                    ...init?.headers,
                },
            },
        );

    if (
        response.status === 401 &&
        options?.retryOnUnauthorized
    ) {
        try {
            await refreshSession();

            response = await fetch(
                `${API_URL}${path}`,
                {
                    ...init,
                    credentials:
                        "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                        ...init?.headers,
                    },
                },
            );
        } catch {
            if (options.redirectOnUnauthorized) {
                redirectToLogin();
            }

            throw new SessionExpiredError();
        }
    }

    if (response.status === 401 && options?.retryOnUnauthorized) {
        if (options.redirectOnUnauthorized) {
            redirectToLogin();
        }

        throw new SessionExpiredError();
    }

    if (
        response.status === 401 &&
        options?.redirectOnUnauthorized
    ) {
        redirectToLogin();
        throw new SessionExpiredError();
    }

    return parseJson(
        response,
    );
}

export async function login(
    payload: AuthPayload,
) {
    return authRequest(
        "/auth/login",
        {
            method: "POST",
            body: JSON.stringify({
                email: payload.email,
                password:
                    payload.password,
            }),
        },
    ) as Promise<{ user: User }>;
}

export async function register(
    payload: AuthPayload,
) {
    return authRequest(
        "/auth/register",
        {
            method: "POST",
            body: JSON.stringify({
                email: payload.email,
                name: payload.name,
                password:
                    payload.password,
            }),
        },
    ) as Promise<{ user: User }>;
}

export async function getCurrentUser() {
    return authRequest(
        "/auth/me",
        {
            method: "GET",
        },
        {
            retryOnUnauthorized: true,
            redirectOnUnauthorized: true,
        },
    ) as Promise<User>;
}

export async function getCurrentUserOrNull() {
    try {
        return await authRequest(
            "/auth/me",
            {
                method: "GET",
            },
            {
                retryOnUnauthorized: true,
                redirectOnUnauthorized: false,
            },
        ) as User;
    } catch (error) {
        if (isSessionExpiredError(error)) {
            return null;
        }

        throw error;
    }
}

export async function getAuthProviders() {
    return authRequest(
        "/auth/providers",
        {
            method: "GET",
        },
    ) as Promise<AuthProviders>;
}

export async function logout() {
    return authRequest(
        "/auth/logout",
        {
            method: "POST",
        },
    ) as Promise<{ success: boolean }>;
}