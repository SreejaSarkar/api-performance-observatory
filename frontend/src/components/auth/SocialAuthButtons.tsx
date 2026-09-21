"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    GitBranch,
    Globe,
} from "lucide-react";
import toast from "react-hot-toast";

import { getAuthProviders } from "@/lib/auth-api";

type Props = {
    nextPath?: string;
};

const providers = [
    {
        key: "google",
        label: "Continue with Google",
        icon: <Globe className="h-4 w-4" />,
    },
    {
        key: "github",
        label: "Continue with GitHub",
        icon: <GitBranch className="h-4 w-4" />,
    },
] as const;

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001";

export default function SocialAuthButtons({
    nextPath = "/projects",
}: Props) {
    const [providerAvailability, setProviderAvailability] = useState({
        google: false,
        github: false,
    });
    const [loadingProviders, setLoadingProviders] = useState(true);

    const sanitizedNextPath =
        useMemo(() => {
            return nextPath.startsWith("/")
                ? nextPath
                : "/projects";
        }, [nextPath]);

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const availability = await getAuthProviders();

                if (active) {
                    setProviderAvailability(availability);
                }
            } catch {
                if (active) {
                    setProviderAvailability({
                        google: false,
                        github: false,
                    });
                }
            } finally {
                if (active) {
                    setLoadingProviders(false);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    function handleUnavailableProvider(providerLabel: string) {
        toast(`${providerLabel} sign-in is not configured yet on the backend.`, {
            id: `${providerLabel}-social-auth-unavailable`,
            icon: "i",
        });
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
                {providers.map((provider) => {
                    const isEnabled = providerAvailability[provider.key];
                    const sharedClassName = `
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-2xl
                            border
                            border-white/12
                            bg-white/[0.04]
                            px-4
                            py-3.5
                            text-sm
                            font-semibold
                            text-slate-100
                            shadow-[0_18px_45px_rgba(2,6,23,0.18)]
                            backdrop-blur-sm
                            transition
                            hover:-translate-y-0.5
                            hover:border-sky-300/35
                            hover:bg-white/[0.08]
                        `;

                    if (!loadingProviders && isEnabled) {
                        return (
                            <a
                                key={provider.key}
                                href={`${API_URL}/auth/${provider.key}?next=${encodeURIComponent(sanitizedNextPath)}`}
                                className={sharedClassName}
                            >
                                {provider.icon}
                                {provider.label}
                            </a>
                        );
                    }

                    return (
                        <button
                            key={provider.key}
                            type="button"
                            onClick={() =>
                                handleUnavailableProvider(
                                    provider.label,
                                )
                            }
                            className={`${sharedClassName} opacity-70`}
                        >
                            {provider.icon}
                            {provider.label}
                        </button>
                    );
                })}
            </div>

            <p className="text-sm leading-6 text-slate-400">
                Use Google or GitHub when the corresponding OAuth provider is configured on the backend.
            </p>
        </div>
    );
}