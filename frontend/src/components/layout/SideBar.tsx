"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    LayoutDashboard,
    FolderKanban,
    Bell,
    TriangleAlert,
    FileText,
    Webhook,
} from "lucide-react";
import {
    useAuthSession,
} from "@/components/auth/AuthSessionProvider";
import { logout }
    from "@/lib/auth-api";
import {
    clearSelectedProject,
    useSelectedProject,
} from "@/lib/selected-project";
import toast from "react-hot-toast";

const navItems = [
    {
        href: "/projects",
        label: "Projects",
        icon: <FolderKanban size={18} />,
    },
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
    },
    {
        href: "/alerts",
        label: "Alerts",
        icon: <Bell size={18} />,
    },
    {
        href: "/anomalies",
        label: "Anomalies",
        icon: <TriangleAlert size={18} />,
    },
    {
        href: "/reports",
        label: "Reports",
        icon: <FileText size={18} />,
    },
    {
        href: "/webhooks",
        label: "Webhooks",
        icon: (
            <Webhook
                className="
                    w-4
                    h-4
                "
            />
        ),
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const {
        isAuthenticated,
        loading,
        user,
    } = useAuthSession();
    const selectedProject =
        useSelectedProject();

    async function handleLogout() {
        try {
            await logout();
            clearSelectedProject();

            toast.success(
                "Signed out",
            );

            window.location.assign(
                "/auth/login",
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to sign out",
            );
        }
    }

    return (
        <aside
            className="
                hidden
                md:flex

                md:w-64
                lg:w-72

                flex-col

                bg-slate-900/80
                border-r
                border-slate-800
                backdrop-blur

                min-h-screen
                sticky
                top-0
            "
        >
            <div
                className="
                    p-6
                    border-b
                    border-slate-800
                "
            >
                <h1
                    className="
                        text-xl
                        font-bold
                        text-white
                    "
                >
                    🚀 API Observatory
                </h1>

                <p
                    className="
                        text-slate-400
                        text-sm
                        mt-1
                    "
                >
                    Monitor. Detect. Resolve.
                </p>
            </div>

            <nav
                className="
                    flex-1
                    p-4
                    flex
                    flex-col
                    gap-2
                "
            >
                {navItems.map(
                    (item) => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                            disabled={loading || !isAuthenticated}
                            requiresProject={
                                item.href !== "/projects"
                            }
                            hasProject={Boolean(
                                selectedProject,
                            )}
                            active={
                                pathname ===
                                    item.href ||
                                pathname.startsWith(
                                    `${item.href}/`,
                                )
                            }
                        />
                    ),
                )}
            </nav>

            <div
                className="
                    mx-4
                    mb-4
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-950/60
                    px-4
                    py-3
                    text-sm
                    text-slate-400
                    space-y-3
                "
            >
                {loading ? (
                    <p>
                        Checking session...
                    </p>
                ) : isAuthenticated ? (
                    <>
                        <p>
                            Signed in as {user?.name}. You can sign out from any screen here.
                        </p>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-700
                                bg-slate-900
                                px-4
                                py-2.5
                                text-left
                                font-medium
                                text-slate-100
                                transition
                                hover:border-slate-500
                                hover:bg-slate-800
                            "
                        >
                            Sign out
                        </button>
                    </>
                ) : (
                    <p>
                        Sign in to unlock navigation and project data.
                    </p>
                )}
            </div>
        </aside>
    );
}

function NavItem({
    href,
    icon,
    label,
    disabled,
    requiresProject,
    hasProject,
    active,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    disabled: boolean;
    requiresProject: boolean;
    hasProject: boolean;
    active: boolean;
}) {
    const projectBlocked =
        !disabled &&
        requiresProject &&
        !hasProject;

    const className = `
        flex
        items-center
        gap-3
        p-3
        rounded-xl
        transition
        ${
            disabled || projectBlocked
                ? "cursor-not-allowed text-slate-500"
                : active
                  ? "bg-slate-800 text-white"
                  : "hover:bg-slate-800 text-slate-100"
        }
    `;

    if (disabled || projectBlocked) {
        return (
            <button
                type="button"
                aria-disabled="true"
                className={className}
                onClick={() => {
                    if (projectBlocked) {
                        toast.error(
                            "Please select a project first to proceed.",
                            {
                                id: "require-project",
                            },
                        );
                    }
                }}
            >
                {icon}
                {label}
            </button>
        );
    }

    return (
        <Link
            href={href}
            className={className}
        >
            {icon}
            {label}
        </Link>
    );
}