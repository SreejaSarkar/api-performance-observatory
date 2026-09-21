"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    FormEvent,
    Suspense,
    useState,
} from "react";
import toast from "react-hot-toast";

import { register }
    from "@/lib/auth-api";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

export default function RegisterPage() {
    return (
        <Suspense fallback={null}>
            <RegisterPageContent />
        </Suspense>
    );
}

function RegisterPageContent() {
    const searchParams =
        useSearchParams();

    const [name, setName] =
        useState("");
    const [email, setEmail] =
        useState("");
    const [password, setPassword] =
        useState("");
    const [submitting, setSubmitting] =
        useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        try {
            setSubmitting(true);

            await register({
                name,
                email,
                password,
            });

            toast.success(
                "Account created",
            );

            const nextPath =
                searchParams.get(
                    "next",
                );

            const destination =
                nextPath &&
                nextPath.startsWith("/")
                    ? nextPath
                    : "/projects";

            window.location.assign(
                destination,
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to create account",
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
                    bg-[radial-gradient(circle_at_15%_15%,rgba(34,197,94,0.22),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(56,189,248,0.15),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(251,191,36,0.18),transparent_35%)]
                "
            />

            <div
                className="
                    absolute
                    left-[8%]
                    bottom-[10%]
                    h-56
                    w-56
                    rounded-full
                    bg-emerald-300/12
                    blur-3xl
                "
            />

            <div
                className="
                    absolute
                    right-[12%]
                    top-[12%]
                    h-44
                    w-44
                    rounded-full
                    bg-cyan-300/10
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
                    lg:grid-cols-[0.95fr_1.05fr]
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

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="
                        relative
                        order-2
                        w-full
                        rounded-[32px]
                        border
                        border-emerald-300/18
                        bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.78))]
                        p-6
                        shadow-[0_28px_90px_rgba(2,6,23,0.52)]
                        backdrop-blur-2xl
                        space-y-5
                        sm:p-8
                        lg:order-1
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
                            via-emerald-200/75
                            to-transparent
                        "
                    />

                    <div>
                        <p
                            className="
                                text-xs
                                uppercase
                                tracking-[0.38em]
                                text-emerald-200/75
                            "
                        >
                            Observatory
                        </p>
                        <h1
                            className="
                                mt-3
                                text-4xl
                                font-bold
                                text-white
                            "
                        >
                            Create account
                        </h1>
                        <p
                            className="
                                mt-3
                                max-w-md
                                leading-7
                                text-slate-300
                            "
                        >
                            Set up your workspace, create projects, and start tracking performance with a sharper dashboard experience.
                        </p>
                    </div>

                    <SocialAuthButtons
                        nextPath={
                            searchParams.get(
                                "next",
                            ) ?? "/projects"
                        }
                    />

                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                            or create with email
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
                            space-y-4
                            shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
                        "
                    >
                        <label
                            className="
                                block
                                space-y-2
                            "
                        >
                            <span className="text-sm font-medium tracking-[0.01em] text-slate-100">Name</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(
                                        event.target.value,
                                    )
                                }
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
                                    focus:border-emerald-400
                                    focus:bg-slate-950
                                "
                                placeholder="Jane Smith"
                                required
                            />
                        </label>

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
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value,
                                    )
                                }
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
                                    focus:border-emerald-400
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
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value,
                                    )
                                }
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
                                    focus:border-emerald-400
                                    focus:bg-slate-950
                                "
                                placeholder="Create a strong password"
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
                                bg-[linear-gradient(135deg,#34d399,#059669)]
                                px-4
                                py-3.5
                                text-base
                                font-semibold
                                text-white
                                shadow-[0_20px_45px_rgba(5,150,105,0.32)]
                                transition
                                hover:-translate-y-0.5
                                hover:shadow-[0_24px_55px_rgba(5,150,105,0.4)]
                                disabled:cursor-not-allowed
                                disabled:opacity-70
                            "
                        >
                            {submitting
                                ? "Creating account..."
                                : "Create account"}
                        </button>
                    </div>

                    <p className="text-sm text-slate-300">
                        Already have an account?{" "}
                        <Link
                            href="/auth/login"
                            className="font-medium text-emerald-300 transition hover:text-emerald-200"
                        >
                            Sign in
                        </Link>
                    </p>
                </form>

                <section
                    className="
                        order-1
                        rounded-[32px]
                        border
                        border-white/10
                        bg-[linear-gradient(180deg,rgba(8,17,33,0.86),rgba(8,17,33,0.52))]
                        p-7
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                        sm:p-8
                        lg:order-2
                        lg:p-10
                    "
                >
                    <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-100/80">
                        <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 tracking-[0.24em] uppercase">Fast setup</span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 tracking-[0.2em] uppercase text-slate-300">Project-first workspace</span>
                    </div>

                    <h2
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
                        Launch a monitoring workspace that feels sharper from day one.
                    </h2>

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
                        Create your account, connect a project, and start tracking the metrics, reports, and webhook flows that matter to your team.
                    </p>

                    <div className="mt-8 space-y-4">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                            <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">Team ready</p>
                            <p className="mt-2 text-xl font-semibold text-white">Roles, ownership, and auth already built in.</p>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Realtime visibility</p>
                            <p className="mt-2 text-xl font-semibold text-white">Dashboards, alerts, anomalies, and reports stay within one visual system.</p>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                            <p className="text-xs uppercase tracking-[0.22em] text-amber-200/70">Low friction</p>
                            <p className="mt-2 text-xl font-semibold text-white">Use email today, then switch to Google or GitHub as soon as provider keys are in place.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}