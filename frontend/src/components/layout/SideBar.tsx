"use client";

import Link from "next/link";

import {
    LayoutDashboard,
    FolderKanban,
    Bell,
    TriangleAlert,
    FileText,
    Webhook,
} from "lucide-react";

export default function Sidebar() {
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
                <Link
                    href="/projects"
                    className="
                        flex
                        items-center
                        gap-3
                        p-3
                        rounded-xl
                        hover:bg-slate-800
                        transition
                    "
                >
                    <FolderKanban size={18} />
                    Projects
                </Link>

                <Link
                    href="/dashboard"
                    className="
                        flex
                        items-center
                        gap-3
                        p-3
                        rounded-xl
                        hover:bg-slate-800
                        transition
                    "
                >
                    <LayoutDashboard size={18} />
                    Dashboard
                </Link>

                <Link
                    href="/alerts"
                    className="
                        flex
                        items-center
                        gap-3
                        p-3
                        rounded-xl
                        hover:bg-slate-800
                        transition
                    "
                >
                    <Bell size={18} />
                    Alerts
                </Link>

                <Link
                    href="/anomalies"
                    className="
                        flex
                        items-center
                        gap-3
                        p-3
                        rounded-xl
                        hover:bg-slate-800
                        transition
                    "
                >
                    <TriangleAlert size={18} />
                    Anomalies
                </Link>

                <Link
                    href="/reports"
                    className="
                        flex
                        items-center
                        gap-3
                        p-3
                        rounded-xl
                        hover:bg-slate-800
                        transition
                    "
                >
                    <FileText size={18} />
                    Reports
                </Link>

                <Link
                    href="/webhooks"
                    className="
                        flex
                        items-center
                        gap-3
                        p-3
                        rounded-xl
                        hover:bg-slate-800
                        transition
                    "
                >
                    <Webhook
                        className="
                            w-4
                            h-4
                        "
                    />
                    Webhooks
                </Link>
            </nav>
        </aside>
    );
}