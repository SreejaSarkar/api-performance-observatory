"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    FormEvent,
    Suspense,
    useState,
} from "react";
import toast from "react-hot-toast";

import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { login } from "@/lib/auth-api";

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginPageContent />
        </Suspense>
    );
}

function LoginPageContent() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setSubmitting(true);

            await login({
                email,
                password,
            });

            toast.success("Signed in successfully");

            const nextPath = searchParams.get("next");
            const destination = nextPath && nextPath.startsWith("/")
                ? nextPath
                : "/projects";

            window.location.assign(destination);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to sign in",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            className="
                min-h-screen
                relative
                overflow-hidden
                px-4
                py-10
                md:px-8
                lg:px-10
            "
        >
            <div
                className="
                    absolute
                    inset-0
                    bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.22),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(245,158,11,0.18),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.16),transparent_32%)]
                "
            />

            <div
                className="
                    absolute
                    left-[12%]
                    top-[10%]
                    h-48
                    w-48
                    rounded-full
                    bg-sky-400/12
                    blur-3xl
                "
            />

            <div
                className="
                    absolute
                    bottom-[8%]
                    right-[10%]
                    h-56
                    w-56
                    rounded-full
                    bg-amber-300/10
                    blur-3xl
                "
            />

            <div
                className="
                    relative
                    mx-auto
                    grid
                    min-h-[calc(100vh-5rem)]
                    w-full
                    max-w-6xl
                    items-center
                    gap-8
                    lg:grid-cols-[1.05fr_0.95fr]
                "
            >
                <section
                    className="
                        absolute
                        inset-0
                        -z-10
                        rounded-[36px]
                        border
                        border-white/10
                        bg-white/[0.03]
                        shadow-[0_40px_120px_rgba(2,6,23,0.38)]
                        backdrop-blur-sm
                    "
                />

                <section
                    className="
                        rounded-[32px]
                        border
                        border-white/10
                        bg-[linear-gradient(180deg,rgba(8,17,33,0.86),rgba(8,17,33,0.52))]
                        p-7
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                        sm:p-8
                        lg:p-10
                    "
                >
                    <div className="flex flex-wrap items-center gap-3 text-sm text-sky-100/80">
                        <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 tracking-[0.24em] uppercase">Modern auth</span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 tracking-[0.2em] uppercase text-slate-300">Live telemetry workspace</span>
                    </div>

                    <h1
                        className="
                            mt-6
                            max-w-xl
                            text-4xl
                            font-bold
                            leading-[1.02]
                            text-white
                            sm:text-5xl
                            lg:text-6xl
                        "
                    >
                        Observe API health with a cleaner control room.
                    </h1>

                    <p
                        className="
                            mt-5
                            max-w-xl
                            text-base
                            leading-8
                            text-slate-300
                            sm:text-lg
                        "
                    >
                        Sign in to review live latency trends, alert noise, anomaly spikes, and project activity from one focused workspace.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">Health score</p>
                            <p className="mt-3 text-3xl font-bold text-white">98.2%</p>
                            <p className="mt-2 text-sm text-slate-400">Production reliability snapshot across your tracked services.</p>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-amber-200/70">Active alerts</p>
                            <p className="mt-3 text-3xl font-bold text-white">12</p>
                            <p className="mt-2 text-sm text-slate-400">Prioritized incident stream with less noise and clearer severity.</p>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Response time</p>
                            <p className="mt-3 text-3xl font-bold text-white">142ms</p>
                            <p className="mt-2 text-sm text-slate-400">Latency trends surfaced fast enough to catch regressions early.</p>
                        </div>
                    </div>
                </section>

                <form
                    onSubmit={handleSubmit}
                    className="
                        relative
                        w-full
                        rounded-[32px]
                        border
                        border-sky-300/18
                        bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.78))]
                        p-6
                        shadow-[0_28px_90px_rgba(2,6,23,0.52)]
                        backdrop-blur-2xl
                        space-y-5
                        sm:p-8
                    "
                >
                    <div
                        className="
                            absolute
                            inset-x-8
                            top-0
                            h-px
                            bg-gradient-to-r
                            from-transparent
                            via-sky-200/75
                            to-transparent
                        "
                    />

                    <div>
                        <p
                            className="
                                text-xs
                                uppercase
                                tracking-[0.38em]
                                text-sky-200/75
                            "
                        >
                            Observatory
                        </p>
                        <h2
                            className="
                                mt-3
                                text-4xl
                                font-bold
                                text-white
                            "
                        >
                            Sign in
                        </h2>
                        <p
                            className="
                                mt-3
                                max-w-md
                                leading-7
                                text-slate-300
                            "
                        >
                            Access your projects, team membership, and monitoring dashboards.
                        </p>
                    </div>

                    <SocialAuthButtons
                        nextPath={searchParams.get("next") ?? "/projects"}
                    />

                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                            or continue with email
                        </span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div
                        className="
                            rounded-[28px]
                            border
                            border-white/10
                            bg-slate-950/50
                            p-5
                            space-y-5
                            shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
                        "
                    >
                        <label
                            className="
                                block
                                space-y-2
                            "
                        >
                            <span className="text-sm font-medium tracking-[0.01em] text-slate-100">Email</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-slate-700
                                    bg-slate-950/90
                                    px-4
                                    py-3.5
                                    text-slate-100
                                    outline-none
                                    transition
                                    placeholder:text-slate-500
                                    focus:border-sky-400
                                    focus:bg-slate-950
                                "
                                placeholder="you@company.com"
                                required
                            />
                        </label>

                        <label
                            className="
                                block
                                space-y-2
                            "
                        >
                            <span className="text-sm font-medium tracking-[0.01em] text-slate-100">Password</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-slate-700
                                    bg-slate-950/90
                                    px-4
                                    py-3.5
                                    text-slate-100
                                    outline-none
                                    transition
                                    placeholder:text-slate-500
                                    focus:border-sky-400
                                    focus:bg-slate-950
                                "
                                placeholder="Enter your password"
                                minLength={8}
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="
                                w-full
                                rounded-2xl
                                bg-[linear-gradient(135deg,#38bdf8,#2563eb)]
                                px-4
                                py-3.5
                                text-base
                                font-semibold
                                text-white
                                shadow-[0_20px_45px_rgba(37,99,235,0.35)]
                                transition
                                hover:-translate-y-0.5
                                hover:shadow-[0_24px_55px_rgba(37,99,235,0.42)]
                                disabled:cursor-not-allowed
                                disabled:opacity-70
                            "
                        >
                            {submitting ? "Signing in..." : "Sign in"}
                        </button>
                    </div>

                    <p className="text-sm text-slate-300">
                        New here?{" "}
                        <Link
                            href="/auth/register"
                            className="font-medium text-sky-300 transition hover:text-sky-200"
                        >
                            Create an account
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
